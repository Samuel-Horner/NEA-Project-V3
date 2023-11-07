const http = require('node:http'); // set to https later
const fs = require('node:fs');
const path = require('node:path');

function recursiveReadDir(filePath){
    let data = {}
    fs.readdirSync(filePath).forEach((file) => {
        if (fs.statSync(filePath + file).isDirectory()){
            data[file] = recursiveReadDir(filePath + file + '/');
        } else {
            data[file] = {content: fs.readFileSync(filePath + file), 
                type: findMIMEType(path.extname(file).slice(1))};
        }
    });
    return data
} // Recursive function to scan and store all files in public

function findMIMEType(fileExt){
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

function recursiveObjSearch(obj, searchArray){
    if (searchArray.length == 1){
        return obj[searchArray[0]];
    } else {
        return recursiveObjSearch(obj[searchArray[0]], searchArray.slice(1));
    }
} // Recursive function to get data from publicFiles
// Utility functions - NOT EXPORTED ^^^

class Server {
    constructor (hostname, port, options){
        this.hostname = hostname;
        this.port = port
        this.options = options;
    }

    run () {
        this.publicFiles = recursiveReadDir('./public/');

        this.server = http.createServer(this.options, (req, res) => {
            console.log({'method':req.method,'url':req.url});
            switch (req.method){
                case 'GET':
                    // Go to routing here
                    // Below is all temp.
                    let urlArray = req.url.split('/');
                    urlArray = urlArray.slice(1);
                    if (urlArray[0] == 'favicon.ico'){
                        res.writeHead(404);
                        res.end('Error 404 - resource not found')
                    } else {
                        res.writeHead(200, {'Content-Type':`${recursiveObjSearch(this.publicFiles, urlArray).type}`});
                        res.end(recursiveObjSearch(this.publicFiles, urlArray).content);
                    }
                    break;
                default:
                    res.writeHead(405);
                    res.end('Error 405 - method not allowed')
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