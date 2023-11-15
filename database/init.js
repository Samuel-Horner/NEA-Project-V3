const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const crypto = require('node:crypto');

const db = new sqlite3.Database(__dirname + '/dev.db');

// WARNING - Running this code will reset the databasess

db.serialize(() => {
    try {db.run('DROP TABLE devTable;',errorCallback);} catch {} // Attempts to drop the table if it exists
    db.run(`CREATE TABLE devTable (
                rowID INT NOT NULL UNIQUE, 
                someText TEXT, 
                PRIMARY KEY (rowID));`);
    for (i = 0; i < 100; i++){
        let text = crypto.randomBytes(20).toString('hex');
        db.run('INSERT INTO devTable VALUES (?, ?);', [i, text], errorCallback);
    }
    
    db.each('SELECT rowID, someText FROM devTable', (err, row) => {
        console.log(`${row.rowID} ${row.someText}`)
    });
}); // Creates tables

// sqlite.open({
//     filename: '/tmp/database.db',
//     driver: sqlite3.Database
//   }).then((db) => {
//     // do your thing
//   })

function errorCallback(err){
    if (err){
        console.log(err);
    }
}