window.onload = function main() {
  var canvas = document.getElementById("glCanvas");

  aspect = canvas.width / canvas.height;

  // Initialize the GL context
  gl = WebGLUtils.setupWebGL(canvas);

  // Only continue if WebGL is available and working
  if (!gl) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
  }

  var near = 0.1;
  var far = 12.0;
  var radius = 5.0;
  var theta = radians(45.0);
  var phi = radians(45.0);
  var dr = 5.0 * Math.PI / 180.0;

  var fovy = 45.0; // field of view in y dir
  var aspect; //aspect ratio

  var eye;

  var at = vec3(0.0, 0.0, 0.0);
  const up = vec3(0.0, 1.0, 0.0);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

  // Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Cube vertices
  var vertices = [
      // front 
      vec4(0.0, 0.0, 0, 1.0),
      vec4(0.0, 1.0, 0, 1.0),
      vec4(1.0, 1.0, 0, 1.0),
      vec4(1.0, 0.0, 0, 1.0),
      vec4(0.0, 0.0, 0, 1.0),
      //left
      vec4(0.0, 0.0, 1, 1.0),
      vec4(0.0, 1.0, 1, 1.0),
      vec4(0.0, 1.0, 0, 1.0),
      vec4(0.0, 0.0, 0, 1.0),
      vec4(0.0, 0.0, 1, 1.0),
      //back
      vec4(0.0, 1.0, 1, 1.0),
      vec4(1.0, 1.0, 1, 1.0),
      vec4(1.0, 0.0, 1, 1.0),
      vec4(0.0, 0.0, 1, 1.0),
      // right
      vec4(1.0, 0.0, 1, 1.0),
      vec4(1.0, 0.0, 0, 1.0),
      vec4(1.0, 1.0, 0, 1.0),
      vec4(1.0, 1.0, 1, 1.0)
  ];

  // vertex buffer
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition"); // get attribute location from main HTML document
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition); // enable the attributes

  function render() {

      gl.clear(gl.COLOR_BUFFER_BIT); // clear 
      //projection matrix using ortho
      projectionMatrix = perspective(fovy, aspect, near, far)

      // get modelviewmatrix attribute location  
      var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

      // get projectionmatrix attribute location
      var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
      gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

      // modelview matrix for 1 point perspective
      at = vec3(0.0, 0.0, 0.0);
      eye = vec3(0.0, 0.0, 6.5);
      var modelViewMatrix = lookAt(eye, at, up);
      modelViewMatrix = mult(modelViewMatrix, translate(vec3(-2.0, 1.0, 0.0)));
      gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

      gl.drawArrays(gl.LINE_STRIP, 0, vertices.length); // draw points/ wireframe

      // modelview matrix for 2 point perspective
      at = vec3(0.0, 0.0, 0.0);
      eye = vec3(6.5, 0.0, 6.5);
      modelViewMatrix = lookAt(eye, at, up);
      gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

      gl.drawArrays(gl.LINE_STRIP, 0, vertices.length); // draw points/ wireframe

      // modelview matrix for 3 point perspective
      at = vec3(2.0, 2.0, 2.0);
      eye = vec3(6.5, 6.5, 6.5);
      modelViewMatrix = lookAt(eye, at, up);
      modelViewMatrix = mult(modelViewMatrix, translate(vec3(2.0, -1.0, 0.0)))
      gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

      gl.drawArrays(gl.LINE_STRIP, 0, vertices.length); // draw points/ wireframe

  }
  render();
}