const Server = require('./framework/server-class'); // Framework class
require('./database/init').initDB(); // Initialises DB

let mainServer = new Server.Server('localhost','8080',{});
mainServer.run();

/* TODO -
1. Implement proper routing (making use of imported functions?) [server-class.js] --DONE--
2. Add error handling so server doesnt crash on faulty request [server-class.js]
3. Implement a proper DBMS [new files]
4. Connect DBMS to frontend [new files & frontend]
*/