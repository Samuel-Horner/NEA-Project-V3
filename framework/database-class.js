const dbManagement = require('../database/db-mgmt');

class DatabaseAccess extends dbManagement.dbManager { // inherits dbManagement.dbManager
    constructor() {
        super('/dev.db'); // PLACEHOLDER name for production db
    }

    static encrypt(plaintext){
        return plaintext
    } // Salt/hash for passwords

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
        await this._dbExec('INSERT INTO accountTbl (username, password) VALUES ($username,$password)', {
            $username : username,
            $password : DatabaseAccess.encrypt(password)    
        }).then((result) => {
            if (result.changes == 1){ 
                DatabaseAccess.writeResult(res, null, result, 200);
            }
        }).catch((err) => {
            console.log(err);
            DatabaseAccess.writeResult(res, err, null, 200);
        });
    }

    async login(username, password, res){
        await this._dbGet('SELECT accountID FROM accountTbl WHERE accountTbl.username = $username AND accountTbl.password = $password;', {
            $username : username,
            $password : DatabaseAccess.encrypt(password)
        }).then((result) => {
            if (result){
                DatabaseAccess.writeResult(res, null, result, 200);
            }
            else {
                DatabaseAccess.writeResult(res, {errno: 0, errdsc: 'No account found.'}, null, 200);
            }
        }).catch((err) => {
            console.log(err);
            DatabaseAccess.writeResult(res, err, null, 200);
        });;
    }
}

module.exports = {DatabaseAccess};