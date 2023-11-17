const dbManagement = require('../database/db-mgmt');

class DatabaseAccess extends dbManagement.dbManager { // inherits dbManagement.dbManager
    constructor() {
        super('/dev.db'); // PLACEHOLDER name for production db
    }

    async createAccount (email, password, res){
        await this._dbExec('INSERT INTO accountTbl (email, password) VALUES ($email,$password)', {
            $email : email,
            $password : password    
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