const dbManagement = require('../database/db-mgmt');
const crypto = require('node:crypto');

/** Class to handle all database operations
 * @extends dbManager
 */
class DatabaseAccess extends dbManagement.dbManager { // inherits dbManagement.dbManager
    constructor(db_path) {
        super(db_path); // PLACEHOLDER name for production db
    }

    /**
     * Generates a salt of the desired length
     * @param {Number} length 
     * @returns {String} salt
     */
    static #generateSalt(length){
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0,length);
        // https://blog.logrocket.com/building-a-password-hasher-in-node-js/
    }

    /**
     * Uses HMAC with sha512 and a salt to hash some input data
     * @param {String} plaintext 
     * @param {String} salt 
     * @returns {String} hashed data
     */
    static #hash(plaintext, salt){
        let hash = crypto.createHmac('sha512', salt);
        hash.update(plaintext);
        return {hashedValue: hash.digest('hex'), salt: salt};
    }

    /**
     * Compares a plaintext password with a hashed password
     * @param {String} inputPassword 
     * @param {String} salt 
     * @param {String} desiredPassword 
     * @returns {Boolean} boolean result
     */
    static #validatePassword(inputPassword, salt, desiredPassword){
        let hashedPassword = DatabaseAccess.#hash(inputPassword, salt).hashedValue;
        return hashedPassword == desiredPassword;
    } 

    /**
     * Creates an account -
     * Can fail, returning an errno of 19 if the username already exists,
     * or an errno of 0 if the password is invalid
     * @param {String} username - Account username
     * @param {String} password - Plaintext password 
     * @returns {Object} Either: 
     *              - {lastID, changes} for success 
     *              - {errno, errdsc} for fail
     */
    createAccount(username, password){
        if (password.length < 8){
            return {errno: 0, errdsc: 'Password must be a minimum of 8 characters long.'};
        } // Fail - password not long enough
        if (username.length > 20 || username.length < 1) {
            return {errno: 0, errdsc: 'Username must be within 1-20 characters long.'};
        } // Fail - username invalid
        const hashInformation = DatabaseAccess.#hash(password, DatabaseAccess.#generateSalt(128)); 
        return this._dbExec('INSERT INTO accountTbl (username, password, salt) VALUES ($username,$password, $salt);', {
            $username : username,
            $password : hashInformation.hashedValue,
            $salt: hashInformation.salt
        }).then((result) => {
            if (result.changes == 1){ 
                return result; // Success - created account
            }
        }).catch((err) => {
            if (err.errno != 19){console.log(err);} // Dont log 'username already exists' errors
            return err; // Fail - unknown
        });
    }

    /**
     * Attempts to login - 
     * Can fail, returning an errno of 0 if the password is incorrect or if there are no accounts found
     * @param {String} username - Account username
     * @param {String} password - Plaintext password
     * @returns {Object} Either:
     *              - {username, success} if success
     *              - {errno, errdsc} if failiure
     */
    login(username, password){
        return this._dbGet('SELECT password, salt FROM accountTbl WHERE accountTbl.username = $username;', {
            $username : username
        }).then((result) => {
            if (result){
                if (DatabaseAccess.#validatePassword(password, result.salt, result.password)){
                    return {username: username}; // Success
                } else {
                    return {errno: 0, errdsc: 'Wrong password'}; // Fail - wrong password
                }
            } else {
                return {errno: 0, errdsc: 'No account found'}; // Fail - no account found
            }
        }).catch((err) => {
            console.log(err);
            return err; // Fail - unkown
        });
    }

    /**
     * Returns all projects associated with a specific account - 
     * Can fail, returning an errno of 0 if no projects are found
     * @param {String} username - Account username
     * @returns {Object} Either:
     *              - An array of {projectName, projectID} if success
     *              - {errno, errdsc} if failiure
     */
    getProjects(username){
        return this._dbAll('SELECT projectName, projectID FROM projectTbl WHERE projectTbl.username = $username;', {
            $username: username
        }).then((result) => {
            if (result.length != 0){
                return result; // Success
            } else {
                return this._dbGet('SELECT username FROM accountTbl WHERE accountTbl.username = $username', {
                    $username: username
                }).then((result) => {
                    if (result){
                        return {errno: 0, errdsc: 'No projects found.'} // Fail - no projects saved
                    } else {
                        return {errno: 1, errdsc: 'No account found.'} // Fail - no account found
                    }
                })    
            }
        }).catch((err) => {
            console.log(err);
            return err; // Fail - unkown
        });
    }

    /**
     * Attempts to delete an account
     * @param {String} username - Account username 
     * @param {String} password - Plaintext password
     * @returns {Object} Either:
     *              - {lastID, changes} if success
     *              - {errno, errdsc} if failiure
     */
    deleteAccount(username, password){
        return this.login(username, password).then((result) => {
            if (result.username == username){
                return this._dbExec('DELETE FROM accountTbl WHERE accountTbl.username = $username;', {
                    $username: username
                }).then((result) => {
                    return result;// Success
                });
            } else {
                return result; // Fail - login failed
            }
        }).catch((err) => {
            console.log(err);
            return err; // Fail - unkown
        });
    } // Attempts to delete account

    /**
     * Creates a new project or updates an existing one
     * @param {String} username - Account userame
     * @param {String} password - Plaintext password
     * @param {String} projectName - Project Name
     * @param {Array[String]} projectContent - Project content
     * @param {Number} projectID - Project ID
     * @returns {Object} Either:
     *              - {projectID} if success
     *              - {errno, errdsc} if failiure
     */
    saveProject(username, password, projectName, projectContent, projectID){
        return this.login(username, password).then((result) => {
            if (result.username == username) {
                return this._dbGet('SELECT projectName FROM projectTbl WHERE projectTbl.projectID = $projectID and projectTbl.username = $username;', {
                        $projectID: projectID,
                        $username: username
                    }).then(result => {
                        if (result && result.projectName == projectName) { // Project already exists
                            projectContent.forEach((element, index) => {
                                this._dbExec('UPDATE contentTbl SET content = $content WHERE contentTbl.projectID = $projectID AND contentTbl.type = $type;', {
                                    $projectID: projectID,
                                    $type: index,
                                    $content: element
                                });  
                            });
                            return {projectID: projectID}; // Success
                        } else { // Project does not already exist, or is being forked (same ID different name)
                            return this._dbExec(`INSERT INTO projectTbl(projectName, username) VALUES (
                                $projectName, $username
                            );`, {
                                $projectName: projectName,
                                $username: username
                            }).then((result) => {
                                projectID = result.lastID;
                                projectContent.forEach((element, index) => {
                                    this._dbExec('INSERT INTO contentTbl VALUES ($projectID, $type, $content);', {
                                        $projectID: projectID,
                                        $type: index,
                                        $content: element
                                    });  
                                });
                                return {projectID: projectID}; // Success
                            });
                        }
                    });
            } else {
                return result; // Fail - Login failed
            }
        }).catch((err) => {
            console.log(err);
            return err; // Fail - unkown
        });
    }

    /**
     * Gets all project data associated with a projectID
     * @param {Number} projectID - Project ID
     * @returns {Object} Either:
     *              - {projectContent, projectName} if success
     *              - {errno, errdsc} if failiure
     */
    loadProject(projectID){
        return this._dbAll('SELECT content, type FROM contentTbl WHERE contentTbl.projectID = $projectID;', {
            $projectID: projectID
        }).then(result => {
            if (result.length != 0){
                let projectContent = [0,0,0,0];
                result.forEach(element => {
                    projectContent[element.type] = element.content;
                });
                return this._dbGet('SELECT projectName FROM projectTbl WHERE projectTbl.projectID = $projectID;',{
                    $projectID: projectID
                }).then(result => {
                    return {projectContent: projectContent, projectName: result.projectName}; // Success
                })
            } else {
                return {errno: 0, errdsc: 'No project found'}; // Fail - no project found
            }
        }).catch(err => {
            console.log(err);
            return err; // Fail - unkown
        });
    }

    /**
     * Delets the given project
     * @param {String} username - Account username
     * @param {String} password - Plaintext password
     * @param {Number} projectID - Project ID
     * @returns {Object}  Either:
     *              - {lastID, changes} if success
     *              - {errno, errdsc} if failiure
     */
    deleteProject(username, password, projectID){
        return this.login(username, password).then((result) => {
            if (result.username == username){
                return this._dbExec('DELETE FROM projectTbl WHERE projectTbl.projectID = $projectID AND projectTbl.username = $username', {
                    $projectID: projectID,
                    $username: username 
                }).then(result => {
                    if (result.changes != 0){
                        return result; // Success
                    } else {
                        return {errno: 0, errdsc: 'No project found'}; // Fail - no project found
                    }
                })
            } else {
                return result; // Fail - login failed
            }
        }).catch((err) => {
            console.log(err);
            return err; // Fail - unkown
        });
    }
}

module.exports = {DatabaseAccess};