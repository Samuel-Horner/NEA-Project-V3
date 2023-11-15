const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(__dirname + '/dev.db');

try {
   db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS accountTbl (
                accountID INT NOT NULL UNIQUE, 
                username TEXT NOT NULL,
                password TEXT NOT NULL, 
                PRIMARY KEY (accountID));`, errorCallback);
        db.run(`CREATE TABLE IF NOT EXISTS projectTbl (
                projectID INT NOT NULL UNIQUE,
                accountID INT NOT NULL,
                projectName TEXT,
                PRIMARY KEY (projectID),
                FOREIGN KEY (accountID) REFERENCES accountTbl(accountID));`, errorCallback);
        db.run(`CREATE TABLE IF NOT EXISTS contentTbl (
                projectID INT NOT NULL,
                type INT NOT NULL,
                content TEXT,
                PRIMARY KEY (projectID, type),
                FOREIGN KEY (projectID) REFERENCES projectTbl(projectID));`, errorCallback);
    }); // Creates tables 
} catch {}

db.close()

function errorCallback(err){
    if (err){
        console.log(err);
    }
}