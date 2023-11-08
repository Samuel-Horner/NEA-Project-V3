const http = require('node:http'); // set to https later
const fs = require('node:fs');
const path = require('node:path');

class Server {
    constructor (hostname, port, options){
        this.hostname = hostname;
        this.port = port
        this.options = options;
    } // Server constructor

    static recursiveReadDir(filePath){
        let data = {}
        fs.readdirSync(filePath).forEach((file) => {
            if (fs.statSync(filePath + file).isDirectory()){
                data[file] = Server.recursiveReadDir(filePath + file + '/');
            } else {
                data[file] = {content: fs.readFileSync(filePath + file), 
                    type: Server.findMIMEType(path.extname(file).slice(1))};
            }
        });
        return data
    } // Recursive function to scan and store all files in public

    static recursiveObjSearch(obj, searchArray){
        if (searchArray.length == 1){
            try {return obj[searchArray[0]];}
            catch {return null;}
        } else {
            return Server.recursiveObjSearch(obj[searchArray[0]], searchArray.slice(1));
        }
    } // Recursive function to get data from publicFiles

    static findMIMEType(fileExt){
        switch (fileExt){
            case 'js':
                return 'text/javascript';
            case 'html':
                return 'text/html';
            case 'css':
                return 'text/css';
            default:    
                return null
        }
    } // Converts file extensions into appropriate MIME type

    static getResource(res, resourceDirectory, url){
        let urlArray = url.split('/').slice(1);
        let tempResource = Server.recursiveObjSearch(resourceDirectory, urlArray);
        if (!tempResource) {
            let fofResource = Server.recursiveObjSearch(resourceDirectory, ['404-page.html']);
            res.writeHead(404, {'Content-Type':'text/html'});
            res.end(fofResource.content);
        } else {
            if (tempResource.type == null){
                Server.error(res, 500);
            } else {
                res.writeHead(200, {'Content-Type':`${tempResource.type}`});
                res.end(tempResource.content);
            }
        }
    } // Handles get requests and sets response

    static error(res, code){
        res.writeHead(code);
        res.end();
    } // Generice error method to respond to client

    run () {
        this.publicFiles = Server.recursiveReadDir('./public/');

        this.server = http.createServer(this.options, (req, res) => {
            console.log({'method':req.method,'url':req.url});
            switch (req.method){
                case 'GET':
                    Server.getResource(res, this.publicFiles, req.url);
                    break;
                case 'POST':
                    // Place holder - should instead go to DB management
                    // https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction
                    let body = [];
                    req.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        res.end(body);
                    });
                    break;
                default:
                    Server.error(res, 405);
                    break;
            }
        });

        this.server.listen(this.port, this.hostname, () => {
            console.log(`Server listening at ${this.hostname}:${this.port}`);
            // Some Exit logic here
        });
    }
}

module.exports = {Server};