const Server = require('./framework/server-class'); // Server framework class

let mainServer = new Server.Server('localhost','8080',{}); // Instantiate Server
require('./database/init.js').initDB().then(() => { // Wait for the DB to be initialised
    mainServer.openDB(__dirname + '/database/dev.db'); // Initliase DB in mainServer 
    // Placeholder db path for production db
    mainServer.run(); // Run the server
}); // Initialises DB and runs server