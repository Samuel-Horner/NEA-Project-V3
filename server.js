const Server = require('./framework/server-class'); // Framework class

let mainServer = new Server.Server('localhost','8080',{});
require('./database/init.js').initDB().then(() => {
    mainServer.openDB(__dirname + '/database/dev.db'); // Placeholder db path for production db
    mainServer.run();
}); // Initialises DB and runs server

/* TODO -
1. Implement proper routing (making use of imported functions?) [server-class.js] --DONE--
2. Add error handling so server doesnt crash on faulty request [server-class.js] -- N/A --
3. Implement a proper DBMS [new files] -- 20% --
4. Connect DBMS to frontend [new files & frontend] -- 20% --
*/