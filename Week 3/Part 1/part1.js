window.onload = function main() {
  var canvas = document.getElementById("glCanvas");

  // Initialize the GL context
  gl = WebGLUtils.setupWebGL(canvas);

  // Only continue if WebGL is available and working
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  vertices = [
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 1.0, 1.0, 1.0),
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(1.0, 0.0, 1.0, 1.0),
    vec4(1.0, 1.0, 0.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0)
  ];

  indices = [
    0, 1,
    0, 2,
    0, 4,
    1, 3,
    1, 5,
    2, 3,
    2, 6,
    3, 7,
    4, 5,
    4, 6,
    5, 7,
    6, 7
  ];

  thetaX = Math.PI/4*0;
  thetaY = -Math.PI/2*0;
  thetaZ =  Math.PI/4*0;

  scale = scalem(1,1,1);
  rotation = getRotationMatrix(thetaX, thetaY, thetaZ);
  rotationMatrix = mult(scale,transpose(rotation));

  m = lookAt(vec3(0.5, 0.5, 0.5),vec3(1,1,0),vec3(0,1,0));
  rotationMatrix = m;
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");

  gl.viewport(0, 0, canvas.width, canvas.height);
  // Set clear color to black, fully opaque
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  // Clear the color buffer with specified clear color


  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();

};

/*
function getRotationMatrix(x, y, z) {
  return [
    1, -z, y, 0,
    z, 1, -x, 0,
    -y, x, 1, 0,
    0, 0, 0, 1
  ];
}
*/

function getRotationMatrix(x, y, z) {
  return mat4(
    Math.cos(z) * Math.cos(y), -Math.sin(z), Math.cos(z) * Math.sin(y) , 0,
    Math.cos(x) * Math.sin(z) * Math.cos(y) + Math.sin(x) * Math.sin(y), Math.cos(x) * Math.cos(z),
    Math.cos(x) * Math.sin(z) * Math.sin(y) - Math.sin(x) * Math.cos(y), 0,
    Math.sin(x) * Math.sin(z) * Math.cos(y)- Math.cos(x) * Math.sin(y), Math.sin(x) * Math.cos(z),
    Math.sin(x) * Math.sin(z) * Math.sin(y) + Math.cos(x) * Math.cos(y), 0,
    0, 0, 0, 1
  );
}



function getMoveMatrix(x,z,y){
return [
    1, 0, 0, x,
    0, 1, 0, y,
    0, 0, 1, z,
    0, 0, 0, 1
  ];
}




function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(rotationMatrix));
  gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_BYTE, 0);
  window.requestAnimFrame(render);
}
