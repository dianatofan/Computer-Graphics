var near = 0.001;
var far = 100.0;
var radius = 10.0;
var theta = 0.0;
var phi = 0.0;

var fovy = 45.0;
var aspect;

var eye;
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


window.onload = function init() {
    var canvas = document.getElementById("glCanvas");
    aspect = canvas.width / canvas.height;

    var gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) {
        console.log("Failed getting a webgl rendering context.");
        return;
    }


    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);


    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    program.vNormal = gl.getAttribLocation(program, "vNormal");
    program.vPosition = gl.getAttribLocation(program, "vPosition");
    program.vColor = gl.getAttribLocation(program, "vColor");

    mesh_data = initVertexBuffers(gl, program);
    readOBJFile("teapot/teapot.obj", gl, mesh_data, 1, true);

    render();

    function render() {
        requestAnimFrame(render);
        if (!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete()) {
            // OBJ and all MTLs are available
            g_drawingInfo = onReadComplete(gl, mesh_data, g_objDoc);
        }
        if (!g_drawingInfo)
            return;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        projectionMatrix = perspective(fovy, aspect, near, far);
        var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        theta += 0.03;
        eye = vec3(radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));
        var modelViewMatrix = lookAt(eye, at, up);

        var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        var vert_num = g_drawingInfo.indices.length;
        gl.drawElements(gl.TRIANGLES, vert_num, gl.UNSIGNED_SHORT, 0);
    };
};

// Create a buffer object and perform initial configuration
function initVertexBuffers(gl, program) {
    var o = new Object();
    o.vertexBuffer = createEmptyArrayBuffer(gl, program.vPosition, 3, gl.FLOAT);
    o.normalBuffer = createEmptyArrayBuffer(gl, program.vNormal, 3, gl.FLOAT);
    o.colorBuffer = createEmptyArrayBuffer(gl, program.vColor, 4, gl.FLOAT);
    o.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return o;
}

//Create a buffer object, assign it to attribute variables and enable the assignment
function createEmptyArrayBuffer(gl, attribute, num, type) {
    var buffer = gl.createBuffer(); //Create a buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(attribute); //Enable the assignment
    return buffer;
}

// read a file
function readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status !== 404) {
            onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
        }
    }
    request.open("GET", fileName, true); //Create a request to get file
    request.send();
}

var g_objDoc = null; // The information of OBJ file
var g_drawingInfo = null; // the information for drawing 3D model
var mesh = null;

// Obj File has been read
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
    var objDoc = new OBJDoc(fileName); //Create an OBJDoc object
    var result = objDoc.parse(fileString, scale, reverse);
    if (!result) {
        g_objDoc = null;
        g_drawingInfo = null;
        console.log("OBJ file parsing error.");
        return;
    }
    g_objDoc = objDoc;
}

//OBJ File has been read completely
function onReadComplete(gl, model, objDoc) {
    //Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();

    //Write data into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    // write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

    return drawingInfo;
}