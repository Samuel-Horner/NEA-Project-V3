const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
/** Class used to perform database operations and store connection */
class dbManager {
    /**
     * Opens the database and stores connection
     * @param {String} dbPath - An absolute file path to the DB
     * @constructor 
     */
    constructor (dbPath) {
        this.db = sqlite.open({
            filename : dbPath,
            mode: sqlite3.OPEN_READWRITE,
            driver: sqlite3.cached.Database
        }).then((res) => {
                res.on('trace', (data) => {
                    console.log(data);
                }); // For debuging, prints any SQL statements recieved by the
                    // DB to the console.
                res.exec('PRAGMA foreign_keys = ON;'); // Enables foreign keys
                return res;
        }).catch((err) => {
            console.log('error in opening db');
            console.log(err);
            process.abort(); // Fail - failed to open DB - probably invalid file path
        }); // Opens the DB - NOTE
            // THIS IS ASYNC
            // Essentially if a request is passed to this object AS it is created,
            // or until however long it takes to open the db, it will fail.
    }

    /**
     * Runs some SQL statement and DOES NOT return result
     * @param {String} sql 
     * @param {Object} params 
     * @returns {Object}
     */
    async _dbExec(sql, params) {
        return await (await this.db).run(sql, params);
    }

    /**
     * Runs some SQL statement and returns the first result row
     * @param {String} sql 
     * @param {Object} params 
     * @returns {Object} Row
     */
    async _dbGet(sql, params){
        return await (await this.db).get(sql, params);
    } 

    /**
     * Runs some SQL statement and returns all result rows
     * @param {String} sql 
     * @param {Object} params 
     * @returns {Array} All rows
     */
    async _dbAll(sql, params){
        return await (await this.db).all(sql, params);
    }
}

module.exports = {dbManager};
