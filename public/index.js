glCanvas = new GLCanvas("glScreen");
runCode();

const resSlider = document.getElementById("resolution_slider");
const resDisplay = document.getElementById("resolution_display");

function runCode(){
    glCanvas.initProgram(GLCanvas.defaultFragment, GLCanvas.defaultVertex);
    glCanvas.initBuffers(GLCanvas.defaultVertices, GLCanvas.defaultIndices);
    glCanvas.renderStart = performance.now();
    glCanvas.render();
}

function resChange(){
    newRes = resSlider.value;
    glCanvas.updateRes(newRes);
    resDisplay.innerText = `${newRes} px`;
}

function editCode(){
    // Pull shader primary key from db, encode into url
    // e.g editor.html?=abcd
    // if default then pass -1
}