const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

async function initDB() {
    const db = await sqlite.open({
        filename : __dirname + '/dev.db',
        driver: sqlite3.Database
    })

    await db.exec(`CREATE TABLE IF NOT EXISTS accountTbl (
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            salt TEXT NOT NULL,
            PRIMARY KEY (username)
            );`); // NOTE - technically username here should be the pk, as account id is redundant,
            // however in the interest of privacy using the account username as the account identifier would be problematic
            // in url encoded requests. THEREFORE 2NF not 3NF
    await db.exec(`CREATE TABLE IF NOT EXISTS projectTbl (
            projectID INTEGER NOT NULL UNIQUE,
            username TEXT NOT NULL,
            projectName TEXT,
            PRIMARY KEY (projectID),
            CONSTRAINT fk_accountTbl
                FOREIGN KEY (username) 
                REFERENCES accountTbl(username) 
                ON DELETE CASCADE
            );`);
    await db.exec(`CREATE TABLE IF NOT EXISTS contentTbl (
            projectID INTEGER NOT NULL,
            type INTEGER NOT NULL,
            content TEXT,
            PRIMARY KEY (projectID, type),
            CONSTRAINT fk_projectTbl
                FOREIGN KEY (projectID) 
                REFERENCES projectTbl(projectID) 
                ON DELETE CASCADE
            );`);
    // Creates tables if they do not exist
    db.close();
}    

module.exports = {initDB};
