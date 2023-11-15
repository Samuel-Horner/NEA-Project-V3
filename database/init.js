const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

async function initDB() {
    const db = await sqlite.open({
        filename : __dirname + '/dev.db',
        driver: sqlite3.Database
    })
    // db.on('trace', (data) => {
    //     console.log(data);
    // }); // Debug information

    db.run(`CREATE TABLE IF NOT EXISTS accountTbl (
            accountID INTEGER NOT NULL, 
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            PRIMARY KEY (accountID));`);
    db.run(`CREATE TABLE IF NOT EXISTS projectTbl (
            projectID INTEGER NOT NULL UNIQUE,
            accountID INTEGER NOT NULL,
            projectName TEXT,
            PRIMARY KEY (projectID),
            FOREIGN KEY (accountID) REFERENCES accountTbl(accountID));`);
    db.run(`CREATE TABLE IF NOT EXISTS contentTbl (
            projectID INTEGER NOT NULL,
            type INTEGER NOT NULL,
            content TEXT,
            PRIMARY KEY (projectID, type),
            FOREIGN KEY (projectID) REFERENCES projectTbl(projectID));`);
    // Creates tables if they do not exist
    db.close();
}    

module.exports = {initDB};
