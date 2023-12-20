const dbManagement = require('../database/db-mgmt');
const crypto = require('node:crypto');

class DatabaseAccess extends dbManagement.dbManager { // inherits dbManagement.dbManager
    constructor(db_path) {
        super(db_path); // PLACEHOLDER name for production db
    }

    static #generateSalt(length){
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0,length);
        // https://blog.logrocket.com/building-a-password-hasher-in-node-js/
    } // Generates salt

    static #hash(plaintext, salt){
        let hash = crypto.createHmac('sha512', salt);
        hash.update(plaintext);
        return {hashedValue: hash.digest('hex'), salt: salt};
    } // Salt/hash for passwords

    static #validatePassword(inputPassword, salt, desiredPassword){
        let hashedPassword = DatabaseAccess.hash(inputPassword, salt).hashedValue;
        return hashedPassword == desiredPassword
    } // Compares a plaintext password to the stored hashed password

    static writeResult(res, err, stm, code){
        res.writeHead(code, {'Content-Type':'application/json'});
        res.end(JSON.stringify({
            error: err,
            stmtResult: stm
        }));
    } // Sends result with http

    async createAccount(username, password, res){
        if (password.length < 8){
            DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'Password must be a minimum of 8 characters long.'}, null, 200);
            return; // Username already exists, abort
        }
        const hashInformation = DatabaseAccess.hash(password, DatabaseAccess.generateSalt(128)); 
        await this._dbExec('INSERT INTO accountTbl (username, password, salt) VALUES ($username,$password, $salt);', {
            $username : username,
            $password : hashInformation.hashedValue,
            $salt: hashInformation.salt
        }).then((result) => {
            if (result.changes == 1){ 
                DatabaseAccess.writeResult(res, null, result, 200); // Success - created account
            }
        }).catch((err) => {
            console.log(err);
            DatabaseAccess.writeResult(res, err, null, 200); // Fail - unknown
        });
    } // Attempts to create an account in the database  if the username does not already exist

    async login(username, password, res){
        await this._dbGet('SELECT accountID, password, salt FROM accountTbl WHERE accountTbl.username = $username;', {
            $username : username
        }).then((result) => {
            if (result){
                if (DatabaseAccess.validatePassword(password, result.salt, result.password)){
                    DatabaseAccess.writeResult(res, null, {accountID: result.accountID}, 200); // Succes
                } else {
                    DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'Wrong password.'}, null, 200); // Fail - wrong password
                }
            } else {
                DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'No account found.'}, null, 200); // Fail - no account with username
            }
        }).catch((err) => {
            console.log(err);
            DatabaseAccess.writeResult(res, err, null, 200); // Fail - unkown
        });
    } // Attempts to login

    async getProjects(accountID, res){
        await this._dbAll(`SELECT projectName, projectID FROM projectTbl WHERE projectTbl.accountID = $accountID;`, {
            $accountID : accountID
        }).then((result) => {
            if (result){
                DatabaseAccess.writeResult(res, null, result, 200);
            } else {
                DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'No projects found.'}, null, 200);
            }
        }).catch((err) => {
            console.log(err);
            DatabaseAccess.writeResult(res, err, null, 200); // Fail - unkown
        });
    } // Returns all projects associated with user

    async deleteAccount(accountID, password, res){
        await this._dbGet('SELECT accountID, password, salt FROM accountTbl WHERE accountTbl.accountID = $accountID;', {
            $accountID: accountID
        }).then((result) => {
            if (result){
                if (DatabaseAccess.validatePassword(password, result.salt, result.password)){
                    this._dbExec('DELETE FROM accountTbl WHERE accountTbl.accountID = $accountID;', {
                        $accountID: accountID
                    }).then((result) => {
                        DatabaseAccess.writeResult(res, null, result, 200); // Succes
                    });
                } else {
                    DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'Wrong password.'}, null, 200);
                } // Fail - wrong password
            }
        }).catch((err) => {
            console.log(err);
            DatabaseAccess.writeResult(res, err, null, 200); // Fail - unkown
        });
    } // Attempts to delete account

    async saveProject(username, password, project_name, project_content, project_id, res){
        await this._dbGet('SELECT accountID, password, salt FROM accountTbl WHERE accountTbl.username = $username;', {
            $username: username
        }).then((result) => {
            if (!result){
                DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'No account found.'}, null, 200);
                return;
            } // Fail - no account found
            let accountID = result.accountID;
            if (DatabaseAccess.validatePassword(password, result.salt, result.password)){
                this._dbGet('SELECT projectName FROM projectTbl WHERE projectTbl.projectID = $projectID and projectTbl.accountID = $accountID;', {
                    $projectID: project_id,
                    $accountID: accountID
                }).then(result => {
                    if (result && result.projectName == project_name){
                        let projectID = project_id;
                        console.log(project_content);
                        project_content.forEach((element, index) => {
                            this._dbExec('UPDATE contentTbl SET content = $content WHERE contentTbl.projectID = $projectID AND contentTbl.type = $type;', {
                                $projectID: projectID,
                                $type: index,
                                $content: element
                            })
                        });
                        DatabaseAccess.writeResult(res, null, {projectID: projectID}, 200); // Success - updated project
                    } else { // No exisiting project with name under account
                        this._dbExec(`INSERT INTO projectTbl(projectName, accountID) VALUES (
                            $projectName, $accountID
                        );`, {
                            $projectName: project_name,
                            $accountID: accountID
                        }).then((result) => {
                            let projectID = result.lastID;
                            console.log(project_content);
                            project_content.forEach((element, index) => {
                                this._dbExec('INSERT INTO contentTbl VALUES ($projectID, $type, $content);', {
                                    $projectID: projectID,
                                    $type: index,
                                    $content: element
                                })
                            });
                            DatabaseAccess.writeResult(res, null, {projectID: projectID}, 200); // Success - made new project
                        });
                    }
                })
            } else {
                DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'Wrong password.'}, null, 200);
            }// Fail - wrong password
        }).catch((err) => {
            console.log(err);
            DatabaseAccess.writeResult(res, err, null, 200); // Fail - unkown
        });
    } // Saves new project or updates exisiting project

    async loadProject(projectID, res){
        await this._dbAll('SELECT content, type FROM contentTbl WHERE contentTbl.projectID = $projectID;', {
            $projectID: Number(projectID)
        }).then(result => {
            if (result){
                let project_content = [0,0,0,0];
                result.forEach(element => {
                    project_content[element.type] = element.content;
                });
                this._dbGet('SELECT projectName FROM projectTbl WHERE projectTbl.projectID = $projectID;',{
                    $projectID: Number(projectID)
                }).then(result => {
                    if (result){
                        DatabaseAccess.writeResult(res, null, {project_content: project_content, project_name: result.projectName}, 200); // Success
                    }
                })
            } else {
                DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'No project found'}, null, 200); // Fail - no project data found
            }
        }).catch(err => {
            console.log(err);
            DatabaseAccess.writeResult(res, err, null, 200)
        }); // Fail - unkown
    } // Returns all project data associated with project id.

    async deleteProject(accountID, password, projectID, res){
        await this._dbGet('SELECT accountID, password, salt FROM accountTbl WHERE accountTbl.accountID = $accountID;', {
            $accountID: accountID
        }).then((result) => {
            if (!result){
                DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'No account found.'}, null, 200);
                return; // Fail - no account found
            }
            if (DatabaseAccess.validatePassword(password, result.salt, result.password)){
                this._dbExec('DELETE FROM projectTbl WHERE projectTbl.projectID = $projectID AND projectTbl.accountID = $accountID', {
                    $projectID: projectID,
                    $accountID: accountID 
                }).then(result => {
                    if(result){
                        DatabaseAccess.writeResult(res, null, result, 200); // Success
                    }
                })
            } else {
                DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'Wrong password.'}, null, 200); // Fail - wrong password
            }
        }).catch(error => {
            DatabaseAccess.writeResult(res, error, null, 200); 
        });// Fail - unkown
    } // Attempts to delete project
}

module.exports = {DatabaseAccess};