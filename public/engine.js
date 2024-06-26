class GLCanvas {
    // Shader Globals
    static defaultVertex = `attribute vec3 a_position; // Vertex position from vertex array
attribute vec3 a_color; // Color to be passes in from vertex array and out to fragment
varying vec3 vColor;

uniform float u_time; // Time since start in seconds
uniform float u_res; // Canvas resolution (u_res * u_res px)
uniform vec3 u_mouse; // Mouse coords : xy - uv coords (only updates when lmb down), z - lmb;

// vec4 gl_Position - vertex position
// Entry point
void main() {
    gl_Position = vec4(a_position, 1.); // Sets the vertex position
    vColor = a_color; // Passes out the vertex color 
}`; // Default vertex shader

    static defaultFragment = `precision highp float; // Must specify a float precision
// Inputs
uniform float u_time; // Time since start in seconds
uniform float u_res; // Canvas resolution (u_res * u_res px)
uniform vec3 u_mouse; // Mouse coords : xy - uv coords (only updates when lmb down), z - lmb;
// vec3 gl_FragCoord - frag coordinates in world space 
varying vec3 vColor; // Vertex colors
// Entry Point
void main() {
    // Normalised Coords
    vec2 uv = gl_FragCoord.xy / u_res;
    // Output Frag Color
    gl_FragColor = vec4(vColor, 1.);
}`; // Default fragment shader

    static defaultVertices = [
        0,0.5,0,1,0,0,
        0.5,-0.5,0,0,1,0,
        -0.5,-0.5,0,0,0,1
    ]; // Starting Triangle

    static defaultIndices = [
        0, 1, 2
    ]; // Starting Triangle

    constructor(canvasID){
        this.canvas = document.getElementById(canvasID);
        if (this.canvas == null){
            alert("Could not find requested canvas");
            return;
        } // Checks if canvas was found
        this.res = 500;
        this.canvas.width = this.res;
        this.canvas.height = this.res;
        this.mouse = {pos: {x : 0, y: 0}, buttons: {lmb: 0}};
        this.prevMousePos = {x: 0, y:0};
        var localObj = this;
        this.canvas.addEventListener("mousemove", function(event){
            if (localObj.mouse.buttons.lmb == 1){
                localObj.mouse.pos = GLCanvas.updateMousePos(event, localObj.canvas);
            }
        });
        this.canvas.addEventListener("mouseup", function(event){
            localObj.mouse.buttons = GLCanvas.mouseUp(event);
        });
        this.canvas.addEventListener("mousedown", function(event){
            localObj.mouse = GLCanvas.mouseDown(event, localObj.canvas);
        });

        this.gl = this.canvas.getContext("webgl");

        if (this.gl == null){
            alert("Failed to create webgl context");
            return;
        } // Checks if browser supports webgl

        this.lastTime = 0;
        this.lastFPSTime = 0;
        this.frames = 0;
        this.fps = 0;
        this.mspf = 0;

        this.gl.viewport(0, 0, this.gl.drawingBuffferWidth, this.gl.drawingBufferHeight);
        this.gl.clearColor(1.0, 0.5, 1.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
    }

    initProgram(fragment_source, vertex_source){
        const vertex_shader = GLCanvas.#loadShader(this.gl, this.gl.VERTEX_SHADER, vertex_source);
        const fragment_shader = GLCanvas.#loadShader(this.gl, this.gl.FRAGMENT_SHADER, fragment_source);
        const shader_program = this.gl.createProgram();
        this.gl.attachShader(shader_program, vertex_shader);
        this.gl.attachShader(shader_program, fragment_shader);
        this.gl.linkProgram(shader_program);

        if (!this.gl.getProgramParameter(shader_program, this.gl.LINK_STATUS)){
            alert(`Unable to link shader program:\n ${this.gl.getProgramInfoLog(shader_program)}`);
            return null;
        }

        const program = {
            program: shader_program,
            attrib_loc: {
                vertex_loc: this.gl.getAttribLocation(shader_program, "a_position"),
                color_loc: this.gl.getAttribLocation(shader_program, "a_color") 
            },
            uniform_loc: {
                time_loc: this.gl.getUniformLocation(shader_program, "u_time"),
                res_loc: this.gl.getUniformLocation(shader_program, "u_res"),
                mouse_loc: this.gl.getUniformLocation(shader_program, "u_mouse")
            }
        };

        this.program = program;
        this.gl.useProgram(this.program.program);
    }

    initBuffers(vertices_source, indices_source){
        if (vertices_source.length % 6 != 0) {alert("Vertices must have 6 values each."); return;}
        let abort = false;
        vertices_source.forEach(e => {
            if (isNaN(e)) {
                alert("Vertices must be numbers"); 
                abort = true; 
                return;
            }
        })
        let maxIndex = 0;
        indices_source.forEach(e => {
            if (isNaN(e)){
                alert("Indices must be numbers"); 
                abort = true;
                return;
            }
            maxIndex = Math.max(e, maxIndex);
        });
        if (maxIndex > (vertices_source.length / 6) - 1) {alert("Indices reference a non existent vertex."); return;}
        if (abort) {return;}
        const vert_buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vert_buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices_source), this.gl.STATIC_DRAW);

        this.indices_length = indices_source.length;        
        const index_buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_source), this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(
            this.program.attrib_loc.vertex_loc,
            3,
            this.gl.FLOAT,
            false,
            6 * Float32Array.BYTES_PER_ELEMENT,
            0
        );

        this.gl.vertexAttribPointer(
            this.program.attrib_loc.color_loc,
            3,
            this.gl.FLOAT,
            true,
            6 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );

        this.gl.enableVertexAttribArray(this.program.attrib_loc.vertex_loc);
        this.gl.enableVertexAttribArray(this.program.attrib_loc.color_loc);
    }

    render(time){
        window.requestAnimationFrame((time) => this.render(time), this.canvas);
        this.time = time;  
        if (this.time - this.lastTime < 20){ // locks to 50fps
            return;
        } else {
            this.lastTime = time;
            this.frames++;
            if (this.time - this.lastFPSTime > 1000){
                this.fps = this.frames / ((this.time - this.lastFPSTime) / 1000);
                this.frames = 0;
                this.lastFPSTime = this.time;
            }
        }

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.uniform1f(this.program.uniform_loc.time_loc, (this.time - this.renderStart) / 1000);
        this.gl.uniform1f(this.program.uniform_loc.res_loc, this.res);
        this.gl.uniform3f(this.program.uniform_loc.mouse_loc, this.mouse.pos.x, this.mouse.pos.y, this.mouse.buttons.lmb);   

        this.gl.drawElements(this.gl.TRIANGLES, this.indices_length, this.gl.UNSIGNED_SHORT, 0);

        this.mspf = performance.now() - this.lastTime;
    }

    updateRes(resolution){
        this.res = resolution
        this.canvas.width = resolution;
        this.canvas.height = resolution;
    }

    static updateMousePos(event, canvas){
        if (canvas == null){return}
        const rect = canvas.getBoundingClientRect();
        let mouse = {x: 0, y: 0};
        function clamp(num, min, max) {return Math.min(Math.max(num,min),max);}
        mouse.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        mouse.y = clamp((rect.height - (event.clientY - rect.top)) / rect.height, 0, 1);
        return mouse;
    }

    static mouseUp(event){
        return {lmb: 0};
    }
    
    static mouseDown(event, canvas){
        let mouse = {pos: {x: 0, y: 0}, buttons: {lmb: 0}}; 
        mouse.pos = GLCanvas.updateMousePos(event, canvas)
        if (event.button == 0){
            event.preventDefault();
            mouse.buttons.lmb = 1;
            return mouse;
        } else {
            mouse.buttons.lmb = 0;
            return mouse;
        }
    }

    static #loadShader(gl, shader_type, shader_source){
        const shader = gl.createShader(shader_type);
        gl.shaderSource(shader, shader_source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            alert(`${shader_type == gl.VERTEX_SHADER ? "The vertex shader" : "The fragment shader"} 
                    could not be compiled:\n${gl.getShaderInfoLog(shader)}`);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
};