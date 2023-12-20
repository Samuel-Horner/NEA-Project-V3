const signInModalContent = `<h1>Please Sign In</h1> <hr> <br>
<label>Username:</label>
<input type="text" id="username" /><br>
<label>Password:</label>
<input type="password" id="password" /><br>
<label>Project Name:</label>
<input type="text" id="project_name" /><br> <br>
<button id="submit-login" onclick="login()">Submit</button>
<div id="modal_output"></div>`;

const projectNameModalContent = `
<label>Project Name:</label>
<input type="text" id="project_name" /><br> <br>
<button id="submit-login" onclick="projectName = document.getElementById('project_name').value;hideModals();sendProjectData();">Submit</button>
<div id="modal_output"></div>`

const modal = document.getElementById('login-modal');
const modalContent = document.getElementById('login-modal-content');
modal.style.display = 'none';

var accountInfo = null;
var projectName = null;

if (window.sessionStorage.getItem('username')){
    accountInfo = {
        username: window.sessionStorage.getItem('username'),
        password: window.sessionStorage.getItem('password')
    }
}

glCanvas = new GLCanvas("glScreen");

var projectID = null;
var editorContainer = null;
if (window.location.search){
    let search = window.location.search;
    if (search.length > 1){search = search.slice(1);}
    let searchArray = search.split('=');
    if (searchArray[0] == 'projectid' && searchArray.length > 1){
        projectID = searchArray[1];
    }
} // There is probably a better way to do this, but it works

if (!projectID){
    loadDefaultPages();
} else {
    loadProjectPages();
}

function loadDefaultPages(){
    editorContainer = new EditorContainer("editor_container",
        [GLCanvas.defaultFragment, 
            GLCanvas.defaultVertex, 
            convertToPrettyString(GLCanvas.defaultVertices, 6),
            convertToPrettyString(GLCanvas.defaultIndices,3)],
        0
    );
    runCode();
}

function loadProjectPages(){
    req('/', {method:'load-project',projectID:projectID}).then(result => {
        if (!result.error){
            editorContainer = new EditorContainer("editor_container",
                [result.stmtResult.projectContent[0], 
                    result.stmtResult.projectContent[1], 
                    result.stmtResult.projectContent[2],
                    result.stmtResult.projectContent[3]],
                0
            );
            document.getElementById('page-info').innerText = result.stmtResult.projectName;
            projectName = result.stmtResult.projectName;
            runCode();
        } else {
            alert(`Error loading project ${projectID}`)
            loadDefaultPages();
        }
    }).catch(error => {
        alert(`Error loading project ${projectID}`)
        loadDefaultPages();
    });   
}

function runCode(){
    editorContainer.syncPages();
    glCanvas.initProgram(editorContainer.pageContent[0], 
        editorContainer.pageContent[1]);
    let vertices = convertToArray(editorContainer.pageContent[2]);
    let indices = convertToArray(editorContainer.pageContent[3]);
    glCanvas.initBuffers(vertices, indices);
    glCanvas.renderStart = performance.now();
    glCanvas.render();
}

function convertToArray(string_input){
    return string_input.toString().replace(/[\[\] \n]/g, "").split(",").map(Number);
}

function convertToPrettyString(array_input, line_interval){
    let output = "";
    for (let i = 0; i < array_input.length; i++){
        output += `${array_input[i]},` + ((i + 1) % line_interval == 0 ? "\n" : "");
    }
    return output.slice(0, -2);
}

// Switching tabs
function fragmentTab(){
    editorContainer.switchPage(0);
}
function vertexTab(){
    editorContainer.switchPage(1);
}
function verticesTab(){
    editorContainer.switchPage(2);
}
function indicesTab(){
    editorContainer.switchPage(3);
}

// Player controlls

const debugInfoDiv = document.getElementById("debug_info");
debugInfoDiv.style.display = "none";
var debugInfoVis = false;
var nextAnimationFrameID = 0;
var debugInfoLast = 0;
const performanceInfo = document.getElementById("performance_info");
const uniformInfo = document.getElementById("uniform_info");

const resSlider = document.getElementById("resolution_slider");
const resDisplay = document.getElementById("resolution_display");

function debugInfo(){
    if (!debugInfoVis){
        debugInfoDiv.style.display = "block";
        nextAnimationFrameID = window.requestAnimationFrame(debugInfoUpdate);
    } else {
        debugInfoDiv.style.display = "none";
        window.cancelAnimationFrame(nextAnimationFrameID);
    }
    debugInfoVis = !debugInfoVis;
}

function debugInfoUpdate(time){
    nextAnimationFrameID = window.requestAnimationFrame(debugInfoUpdate);
    uniformInfo.innerText = 
    `Mouse: {${Math.round(glCanvas.mouse.pos.x * 1000) / 1000},${Math.round(glCanvas.mouse.pos.x * 1000) / 1000},${glCanvas.mouse.buttons.lmb}}
    Time: ${(Math.round(glCanvas.time - glCanvas.renderStart)) / 1000}`;
    if (time - debugInfoLast > 1000){ // Update every second
        debugInfoLast = time;
    } else{
        return;
    }
    performanceInfo.innerText = 
    `FPS: ${Math.round(glCanvas.fps * 100) / 100}
    MSPF: ${Math.round(glCanvas.mspf * 100) / 100}`; 
}

function resChange(){
    newRes = resSlider.value;
    glCanvas.updateRes(newRes);
    resDisplay.innerText = `${newRes} px`;
}

// Save project

function saveCode(){
    if (!accountInfo){
        showModal();
    } else if (!projectID) {
        showProjectNameModal();
    } else { 
        sendProjectData();
    }
}

function login(){
    const dataToSubmit = {
        method: 'log-in',
        username: document.getElementById('username').value,
        password: document.getElementById('password').value 
    }
    req('/', dataToSubmit).then(result => {
        console.log(result);
        if (result.error){ // If login fails
            if (result.error.errno == 0) {
                modalOutput(result.error.errdsc);
            } else {
                modalOutput('UNKOWN ERROR - Sign in failed.');
            }
        } else {
            saveAccountInfo();
            hideModals();
            sendProjectData();
        }
    }).catch(error => {
        console.log(error);
        modalOutput('UNKOWN ERROR - Sign in failed.');
    });
}

function saveAccountInfo(){
    projectName = document.getElementById('project_name').value;
    console.log(projectName);
    accountInfo = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };
    window.sessionStorage.setItem('username',accountInfo.username);
    window.sessionStorage.setItem('password',accountInfo.password);
}

function showModal(){
    modalContent.innerHTML = signInModalContent;
    modal.style.display = 'block';
}

function showProjectNameModal(){
    modalContent.innerHTML = projectNameModalContent;
    modal.style.display = 'block';
}

function hideModals() {
    modal.style.display = 'none';
}

function modalOutput(output){
    document.getElementById('modal_output').innerText = output;
}

function sendProjectData(){
    editorContainer.syncPages();
    req(url = '/', {
        method: 'save-project',
        username: accountInfo.username,
        password: accountInfo.password,
        project_name: projectName,
        project_content: editorContainer.pageContent,
        projectID: projectID
    }).then(res => {
        if (res.error){
            if (res.error.errno == 0) {
                console.log(res);
                modalOutput(res.error.errdsc);
            } else {
                modalOutput('UNKOWN ERROR - Save project failed.');
            }
        } else {
            hideModals();
            projectID = res.stmtResult.projectID;
            document.getElementById('page-info').innerText = projectName;
        }
    });
}
