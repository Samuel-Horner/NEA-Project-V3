const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

async function initDB() {
    const db = await sqlite.open({
        filename : __dirname + '/dev.db',
        driver: sqlite3.Database
    })

    await db.exec(`CREATE TABLE IF NOT EXISTS accountTbl (
            accountID INTEGER NOT NULL UNIQUE,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            salt TEXT NOT NULL,
            PRIMARY KEY (accountID)
            );`); // NOTE - technically email here should be the pk, as account id is redundant,
            // however in the interest of privacy using the account email as the account identifier would be problematic
            // in url encoded requests. THEREFORE 2nf not 3nf
    await db.exec(`CREATE TABLE IF NOT EXISTS projectTbl (
            projectID INTEGER NOT NULL UNIQUE,
            accountID INTEGER NOT NULL,
            projectName TEXT,
            PRIMARY KEY (projectID),
            CONSTRAINT fk_accountTbl
                FOREIGN KEY (accountID) 
                REFERENCES accountTbl(accountID) 
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
    //await db.run('INSERT INTO projectTbl VALUES (1, 1, "testProject")');
    db.close();
}    

module.exports = {initDB};
