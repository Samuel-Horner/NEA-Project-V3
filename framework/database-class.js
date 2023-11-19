const dbManagement = require('../database/db-mgmt');

class DatabaseAccess extends dbManagement.dbManager { // inherits dbManagement.dbManager
    constructor() {
        super('/dev.db'); // PLACEHOLDER name for production db
    }

    static encrypt(plaintext){
        return plaintext
    } // Salt/hash for passwords

    async createAccount (username, password, res){
        if (password.length < 8){
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify({
                error: {errno: 0 , errDsc: 'password must be a minimum of 8 characters long.'},
                stmtResult: null
            }));
            return;
        }
        await this._dbExec('INSERT INTO accountTbl (username, password) VALUES ($username,$password)', {
            $username : username,
            $password : DatabaseAccess.encrypt(password)    
        }).then((result) => {
            if (result.changes == 1){ 
                res.writeHead(200, {'Content-Type':'application/json'});
                res.end(JSON.stringify({
                    error: null,
                    stmtResult: result
                }));
            }
        }).catch((err) => {
            console.log(err);
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify({
                error: err,
                stmtResult: null
            }));
        });
    }
}

module.exports = {DatabaseAccess};