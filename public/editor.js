var editorContainer = new EditorContainer("editor_container",
    [GLCanvas.defaultFragment, 
        GLCanvas.defaultVertex, 
        convertToPrettyString(GLCanvas.defaultVertices, 6),
        convertToPrettyString(GLCanvas.defaultIndices,3)],
    0
);

glCanvas = new GLCanvas("glScreen");
runCode();

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