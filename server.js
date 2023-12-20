const Server = require('./framework/server-class'); // Server framework class

let mainServer = new Server.Server('localhost','8080',{}); // Instantiate Server
require('./database/init.js').initDB().then(() => { // Wait for the DB to be initialised
    mainServer.openDB(__dirname + '/database/dev.db'); // Initliase DB in mainServer 
    // Placeholder db path for production db
    mainServer.run(); // Run the server
}); // Initialises DB and runs server

/* TODO -
1. Implement proper routing (making use of imported functions?) [server-class.js] --DONE--
2. Add error handling so server doesnt crash on faulty request [server-class.js] -- N/a --
3. Implement a proper DBMS [new files] -- 100% --
4. Connect DBMS to frontend [new files & frontend] -- 100% --
5. Refactor server side editor page to handle projectID in url -- 100% --
6. Edit account page and editor page to use session storage for password & accountid -- 100% --
7. Rewrite the fronted and backend to use username as pk in accountTbl -- N/a --
8. Rewrite server & backend class to handle res in resource functions -- N/a --
9. Comment all functions etc. -- N/a --
*/
