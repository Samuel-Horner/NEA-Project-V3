const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');

class dbManager {
    constructor (dbPath) {
        this.db = sqlite.open({
            filename : dbPath,
            mode: sqlite3.OPEN_READWRITE,
            driver: sqlite3.cached.Database
        }).then((res) => {
                res.on('trace', (data) => {
                    console.log(data);
                });
                res.exec('PRAGMA foreign_keys = ON;'); // Enables foreign keys
                return res;
        }).catch((err) => {
            console.log('error in opening db');
            console.log(err);
            process.abort();
        }); // Opens the DB - NOTE
            // THIS IS ASYNC
            // Essentially if a request is passed to this object AS it is created,
            // or until however long it takes to open the db, it will fail.
    }
    async _dbExec(sql, params) {
        return await (await this.db).run(sql, params);
    }

    async _dbGet(sql, params){
        return await (await this.db).get(sql, params);
    }

    async _dbAll(sql, params){
        return await (await this.db).all(sql, params);
    }
} // Wrapper class for db operations

module.exports = {dbManager};