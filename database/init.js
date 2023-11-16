const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

async function initDB() {
    const db = await sqlite.open({
        filename : __dirname + '/dev.db',
        driver: sqlite3.Database
    })

    await db.run(`CREATE TABLE IF NOT EXISTS accountTbl ( 
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            PRIMARY KEY (email));`);
    await db.run(`CREATE TABLE IF NOT EXISTS projectTbl (
            projectID INTEGER NOT NULL UNIQUE,
            email TEXT NOT NULL,
            projectName TEXT,
            PRIMARY KEY (projectID),
            FOREIGN KEY (email) REFERENCES accountTbl(email));`);
    await db.run(`CREATE TABLE IF NOT EXISTS contentTbl (
            projectID INTEGER NOT NULL,
            type INTEGER NOT NULL,
            content TEXT,
            PRIMARY KEY (projectID, type),
            FOREIGN KEY (projectID) REFERENCES projectTbl(projectID));`);
    // Creates tables if they do not exist
    db.close();
}    

module.exports = {initDB};
