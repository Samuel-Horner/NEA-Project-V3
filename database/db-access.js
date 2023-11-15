const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

// async function dbExec (query, params){
//     sqlite.open({
//         filename : './database/dev.db',
//         mode: sqlite3.OPEN_READWRITE,
//         driver: sqlite3.cached.Database
//     })
//     db.on('trace', (data) => {
//         console.log(data);
//     });

//     const res = await db.run(query, params);
    
//     db.close();

//     return res;
// }

// async function createAccount (username, password){
//     console.log(await dbExec('INSERT INTO accountTbl (username, password) VALUES ($username, $password)', {$username : username, $password : password}));
//     console.log(await dbExec('SELECT * FROM accountTbl WHERE accountID IS (1)', []));
// }

class dbManager {
    constructor (dbPath){
        return (async () => {
            this.db = await sqlite.open({
                filename : './database/dev.db',
                mode: sqlite3.OPEN_READWRITE,
                driver: sqlite3.cached.Database
            })
            this.db.on('trace', (data) => {
                console.log(data);
            });
            return this;
        });
    }

    async dbExec(query, params) {
        return this.db.run(query,params);
    }
}

let testObj = await new dbManager();
await testObj.dbExec('INSERT INTO accountTbl (username, password) VALUES (jeff, testPasss);');

// ASYNC HELL
// WHY DID I DO THIS AHSKBZNGISXHBUGZJGNSDIJZHGCXGNSDOPIHCZBOSDOICZXHGOSDBUZCX