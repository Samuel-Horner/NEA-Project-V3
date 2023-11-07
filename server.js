const Server = require('./framework/server-class'); // Framework class


let mainServer = new Server.Server('localhost','8080',{});
mainServer.run();

/* TODO -
1. Implement proper routing (making use of imported functions?) [server-class.js]
2. Add error handling so server doesnt crash on faulty request [server-class.js]
3. Implement a proper ORM [new files]
4. Connect ORM to frontend [new files & frontend]
*/