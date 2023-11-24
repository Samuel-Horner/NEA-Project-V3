const dbManagement = require('../database/db-mgmt');
const crypto = require('node:crypto');

class DatabaseAccess extends dbManagement.dbManager { // inherits dbManagement.dbManager
    constructor() {
        super('/dev.db'); // PLACEHOLDER name for production db
    }

    static generateSalt(length){
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0,length);
        // https://blog.logrocket.com/building-a-password-hasher-in-node-js/
    } // Generates salt

    static hash(plaintext, salt){
        let hash = crypto.createHmac('sha512', salt);
        hash.update(plaintext);
        return {hashedValue: hash.digest('hex'), salt: salt};
    } // Salt/hash for passwords

    static validatePassword(inputPassword, salt, desiredPassword){
        let hashedPassword = DatabaseAccess.hash(inputPassword, salt).hashedValue;
        return hashedPassword == desiredPassword
    }

    static writeResult(res, err, stm, code){
        res.writeHead(code, {'Content-Type':'application/json'});
        res.end(JSON.stringify({
            error: err,
            stmtResult: stm
        }));
    }

    async createAccount(username, password, res){
        if (password.length < 8){
            DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'Password must be a minimum of 8 characters long.'}, null, 200);
            return;
        }
        const hashInformation = DatabaseAccess.hash(password, DatabaseAccess.generateSalt(128)); 
        await this._dbExec('INSERT INTO accountTbl (username, password, salt) VALUES ($username,$password,$salt)', {
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
    }

    async login(username, password, res){
        await this._dbGet('SELECT accountID, password, salt FROM accountTbl WHERE accountTbl.username = $username', {
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
    }
}

module.exports = {DatabaseAccess};