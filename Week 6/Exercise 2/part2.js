"use strict";

var program;
var canvas;
var gl;

var near = 1.0;
var far = 30.0;
var fovy = 90.0;
var aspect = 0.5;

var texSize = 64;
var numRows = 8;
var numCols = 8;

var myTexels = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; ++i) {
  for (var j = 0; j < texSize; ++j) {
    var patchx = Math.floor(i / (texSize / numRows));
    var patchy = Math.floor(j / (texSize / numCols));
    var c = (patchx % 2 != patchy % 2 ? 255 : 0);
    myTexels[4 * i * texSize + 4 * j] = c;
    myTexels[4 * i * texSize + 4 * j + 1] = c;
    myTexels[4 * i * texSize + 4 * j + 2] = c;
    myTexels[4 * i * texSize + 4 * j + 3] = 255;
  }
}

var projectionMatrix;
var pmLoc;

window.onload = function init() {
  var canvas = document.getElementById("glCanvas");

  var gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    console.log("Failed getting a webgl rendering context.");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var vertices = [
    vec4(-4.0, -1.0, -1.0, 1.0),
    vec4(4.0, -1.0, -1.0, 1.0),
    vec4(4.0, -1.0, -21.0, 1.0),
    vec4(-4.0, -1.0, -21.0, 1.0)
  ];

  var colors = [
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0)
  ];

  //Buffers
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  projectionMatrix = perspective(fovy, aspect, near, far);
  pmLoc = gl.getUniformLocation(program, "projectionMatrix");

  //Create a texture object and bind it as the current 2D texture object
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  //set it to be used with the currently bound 2D texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels);

  //Create texture coordinates
  var texCoordsArray = [
    vec2(-1.5, 0.0),
    vec2(2.5, 0.0),
    vec2(2.5, 10.0),
    vec2(-1.5, 10.0)
  ];

  //texture Buffer
  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
  var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTexCoord);

  //Send texture map to fragment shader
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

  gl.generateMipmap(gl.TEXTURE_2D);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  document.getElementById("repeatTexture").onclick = function() { // Repeat
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    render();
};

document.getElementById("clampToEdgeTexture").onclick = function(){ // Clamp to edge
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  render();
};

document.getElementById("nearestFiltering").onclick = function(){ // Nearest
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  render();
};

document.getElementById("linearFiltering").onclick = function(){ // Linear
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  render();
};

document.getElementById("mipmapFiltering").onclick = function(){ // Mipmap
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniformMatrix4fv(pmLoc, false, flatten(projectionMatrix)); 
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
}

  render();
}
