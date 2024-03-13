const http = require('node:http'); // set to https later
const fs = require('node:fs');
const path = require('node:path');
const dataBaseClass = require('./database-class');

/**
 * Class containing HTTP server logic
 */
class Server {
    /**
     * @constructor
     * @param {String} hostname
     * @param {Number} port
     * @param {Object} options - Options to be passed to the HTTP server 
     */
    constructor (hostname, port, options){
        this.hostname = hostname;
        this.port = port
        this.options = options;
    }

    /**
     * Creates an instance of DatabaseAccess to use for DB operations
     * @param {String} db_path - Absolute path to database file
     */
    openDB (db_path) {
        this.dbAccess = new dataBaseClass.DatabaseAccess(db_path);
    }

    /**
     * Gets all contents and MIME types of files in the specified directory and returns them as an object
     * @param {String} filePath - Path to search directory
     * @returns {Object} An object containing the contents of the provided directory and any subdirectories
     */
    static #recursiveReadDir(filePath){
        let data = {}
        fs.readdirSync(filePath).forEach((file) => {
            if (fs.statSync(filePath + file).isDirectory()){
                data[file] = Server.#recursiveReadDir(filePath + file + '/');
            } else {
                data[file] = {content: fs.readFileSync(filePath + file), 
                    type: Server.#findMIMEType(path.extname(file).slice(1))};
            }
        });
        return data
    }

    /**
     * Follows a search path provided in searchArray through a provided object  
     * E.g: ['dir1','dir2','file'] corresponds to 'dir1/dir2/file'
     * @param {Object} obj Object to be searched
     * @param {Array} searchArray Search array
     * @returns {Object} An object containing the contents and MIME type of a file
     */
    static #recursiveObjSearch(obj, searchArray){
        try { var returnObj = obj[searchArray[0]];}
        catch { return null;}
        if (searchArray.length == 1){
            return returnObj
        } else {
            return Server.#recursiveObjSearch(returnObj, searchArray.slice(1));
        }
    }

    /**
     * Converts file extensions into the appropriate MIME type
     * @param {String} fileExt The file extension
     * @returns {String} MIME type
     */
    static #findMIMEType(fileExt){
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
                return 'text/html'
        }
    }

    /**
     * Sends a resource specified in the url with http 
     * @param {http.ServerResponse} res 
     * @param {Object} resourceDirectory An object produced by Server.#recursiveReadDir()
     * @param {String} url The target url
     */
    static #getResource(res, resourceDirectory, url){
        url = decodeURIComponent(url);
        if (url == '/'){
            url = '/account_page.html'; // Default page
        }
        let urlArray = url.split('/').slice(1);
        let searchIndex = urlArray[0].indexOf('?');
        if (searchIndex != -1){
            urlArray[0] = urlArray[0].slice(0,searchIndex);
        }
        let tempResource = Server.#recursiveObjSearch(resourceDirectory, urlArray);
        if (!tempResource) {
            let fofResource = Server.#recursiveObjSearch(resourceDirectory, ['404-page.html']);
            res.writeHead(404, {'Content-Type':'text/html'});
            res.end(fofResource.content);
        } else {
            if (tempResource.type == null){
                Server.#error(res, 500);
            } else {
                res.writeHead(200, {'Content-Type':`${tempResource.type}`});
                res.end(tempResource.content);
            }
        }
    }

    /**
     * Handles a post request (probably by passing information to this.dbAccess) and sends a response with http 
     * @param {http.ServerResponse} res 
     * @param {Object} body Body content of the request -> This is assumed to be JSON encoded
     */
    async #postResourceJSON(res, body){
        const reqBody = JSON.parse(body);
        console.log(reqBody);
        let resultContent = {};
        switch (reqBody.method) {
            case 'create-account':
                if (reqBody.username && reqBody.password) {
                    resultContent = await this.dbAccess.createAccount(reqBody.username, reqBody.password);
                }
                break;
            case 'log-in':
                if (reqBody.username && reqBody.password) {
                    resultContent = await this.dbAccess.login(reqBody.username,reqBody.password);
                }
                break;
            case 'get-projects':
                if (reqBody.username) {
                    resultContent = await this.dbAccess.getProjects(reqBody.username);
                }
                break;
            case 'delete-account':
                if (reqBody.username, reqBody.password) {
                    resultContent = await this.dbAccess.deleteAccount(reqBody.username, reqBody.password);
                }
                break;
            case 'save-project':
                if (reqBody.username && reqBody.password && reqBody.project_name && reqBody.project_content.length == 4 && Array.isArray(reqBody.project_content)) {
                    resultContent = await this.dbAccess.saveProject(reqBody.username, reqBody.password, reqBody.project_name, reqBody.project_content, reqBody.projectID);
                }
                break;
            case 'load-project':
                if (reqBody.projectID) { // This will fail if project ID == 0, but as the ID's start from 1, not a problem
                    resultContent = await this.dbAccess.loadProject(reqBody.projectID);
                }
                break;
            case 'delete-project':
                if (reqBody.username && reqBody.password && reqBody.projectID) {
                    resultContent = await this.dbAccess.deleteProject(reqBody.username, reqBody.password, reqBody.projectID);
                }
                break;
            default:
                break;
        }
        if (Object.keys(resultContent).length == 0){
            Server.#error(res, 500);
            return;
        }

        res.writeHead(200, {'Content-Type':'application/json'});
        if (resultContent.errdsc) {
            res.end(JSON.stringify({error: resultContent, stmtResult: null}));
        } else {
            res.end(JSON.stringify({error: null, stmtResult: resultContent}));
        }
    }

    /**
     * Generic error method to send the given error code as the http response
     * @param {http.ServerResponse} res 
     * @param {Number} code Error code, i.e 405 - method not allowed etc. 
     */
    static #error(res, code){
        console.log(`Error ${code}`); // DEBUG
        res.writeHead(code);
        res.end();
    }

    /**
     * Initialises the http server, NOT THE DB, and runs it.
     */
    run() {
        this.publicFiles = Server.#recursiveReadDir('./public/');

        this.server = http.createServer(this.options, (req, res) => {
            req.on('error', (err) => {
                console.log(err);
                Server.#error(res, 400);
            });
            res.on('error', (err) => {
                console.log(err);
                Server.#error(res, 400);
            })
            console.log({'method':req.method,'url':req.url});
            switch (req.method){
                case 'GET':
                    Server.#getResource(res, this.publicFiles, req.url);
                    break;
                case 'POST':
                    if (!this.dbAccess) {
                        console.log('Tried to access DB before initialisation!');
                        Server.#error(res, 500); // DB is not initialised
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
                                this.#postResourceJSON(res, body);
                                break;
                            default:
                                console.log(body);
                                Server.#error(res, 500);
                                break;
                        }
                    });
                    break;
                default:
                    Server.#error(res, 405);
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