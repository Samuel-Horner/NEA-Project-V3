const http = require('node:http'); // set to https later
const fs = require('node:fs');
const path = require('node:path');
const dataBaseClass = require('./database-class');

class Server {
    constructor (hostname, port, options){
        this.hostname = hostname;
        this.port = port
        this.options = options;
    } // Server constructor

    openDB () {
        this.dbAccess = new dataBaseClass.DatabaseAccess();
    } // Function to be called AFTER db is initialised

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
        try { var returnObj = obj[searchArray[0]];}
        catch { return null;}
        if (searchArray.length == 1){
            return returnObj
        } else {
            return Server.recursiveObjSearch(returnObj, searchArray.slice(1));
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
            case 'png':
                return 'image/png'
            default:    
                return null
        }
    } // Converts file extensions into appropriate MIME type

    static getResource(res, resourceDirectory, url){
        if (url == '/'){
            url = '/editor.html'; // Placeholder index page
        }
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

    postResourceJSON(res, body){
        const reqBody = JSON.parse(body);
        console.log(reqBody);
        switch (reqBody.method) {
            case 'create-account':
                this.dbAccess.createAccount(reqBody.username, reqBody.password, res);
                break;
            case 'log-in':
                this.dbAccess.login(reqBody.username,reqBody.password, res);
                break;
            default:
                Server.error(res, 500);
                break;  
        }
    } // Handles JSON encoded post requests

    static error(res, code){
        console.log(`Error ${code}`); // DEBUG
        res.writeHead(code);
        res.end();
    } // Generic error method to respond to client

    run () {
        this.publicFiles = Server.recursiveReadDir('./public/');

        this.server = http.createServer(this.options, (req, res) => {
            req.on('error', (err) => {
                console.log(err);
                Server.error(res, 400);
            });
            res.on('error', (err) => {
                console.log(err);
                Server.error(res, 400);
            })
            console.log({'method':req.method,'url':req.url});
            switch (req.method){
                case 'GET':
                    Server.getResource(res, this.publicFiles, req.url);
                    break;
                case 'POST':
                    if (!this.dbAccess) {
                        console.log('Tried to access DB before initialisation!');
                        Server.error(res, 500); // DB is not initialised
                        break;
                    }
                    // https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction
                    let body = [];
                    req.on('data', (chunk) => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        switch (req.headers['content-type']) {
                            case 'application/json':
                                this.postResourceJSON(res, body);
                                break;
                            default:
                                console.log(body);
                                Server.error(res, 500);
                                break;
                        }
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