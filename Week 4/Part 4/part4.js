var index = 0;
var nrOfSubdivisions = 2;

var points = [];
var normals = [];
var colors = [];

var radius = 1.5;
var theta = 0.0;
var phi = 0.0;

var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

var fovy = 45.0;
var aspect = 1.0;
var near = 0.01;
var far = 10.0;

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var lightDiffuse = vec4(1.0, 0.0, 0.0, 1.0);
var lightPosition = vec4(0.0, 0.0, 1.0, 0.0);

var materialDiffuse = vec4(0.57, 0.45, 0.63, 1.0); // Kd

var a = 0.1,
  d = 0.4,
  s = 0.6,
  al = 44.0,
  e = 0.7; // reflectance coefficients

var inrender = 0;

function triangle(a, b, c) {
  points.push(a);
  points.push(b);
  points.push(c);

  normals.push(a[0], a[1], a[2], 0.0);
  normals.push(b[0], b[1], b[2], 0.0);
  normals.push(c[0], c[1], c[2], 0.0);

  colors.push(vec4(1.0, 0.0, 0.0, 1.0));
  colors.push(vec4(0.0, 1.0, 0.0, 1.0));
  colors.push(vec4(0.0, 0.0, 1.0, 1.0));

  index += 3;
}


function divideTriangle(a, b, c, count) {
  if (count > 0) {

    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var bc = mix(b, c, 0.5);

    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
  } else {
    triangle(a, b, c);
  }
}


function tetrahedron(a, b, c, d, n) {
  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}

window.onload = function main() {
  var canvas = document.getElementById("glCanvas");

  // Initialize the GL context
  gl = WebGLUtils.setupWebGL(canvas);

  // Only continue if WebGL is available and working
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // get values from sliders
  gl.uniform1f(gl.getUniformLocation(program, "Ka"), a);
  gl.uniform1f(gl.getUniformLocation(program, "Kd"), d);
  gl.uniform1f(gl.getUniformLocation(program, "Ks"), s);
  gl.uniform1f(gl.getUniformLocation(program, "alpha"), al);
  gl.uniform1f(gl.getUniformLocation(program, "lightEmission"), e);


  var ambientHTML = document.getElementById("ambientLabel")
  document.getElementById("ambient").onchange = function() {
    var a = parseFloat(event.srcElement.value);
    ambientHTML.innerHTML = a;
    gl.uniform1f(gl.getUniformLocation(program, "Ka"), a);
  };

  var diffuseHTML = document.getElementById("diffuseLabel")
  document.getElementById("diffuse").onchange = function() {
    var d = parseFloat(event.srcElement.value);
    diffuseHTML.innerHTML = d;
    gl.uniform1f(gl.getUniformLocation(program, "Kd"), d);
  };

  var specularHTML = document.getElementById("specularLabel")
  document.getElementById("specular").onchange = function() {
    var s = parseFloat(event.srcElement.value);
    specularHTML.innerHTML = s;
    gl.uniform1f(gl.getUniformLocation(program, "Ks"), s);
  };

  var alphaHTML = document.getElementById("alphaLabel")
  document.getElementById("alpha").onchange = function() {
    var al = parseFloat(event.srcElement.value);
    alphaHTML.innerHTML = al;
    gl.uniform1f(gl.getUniformLocation(program, "alpha"), al);
  };

  var emissionHTML = document.getElementById("emissionLabel")
  document.getElementById("emission").onchange = function() {
    var e = parseFloat(event.srcElement.value);
    emissionHTML.innerHTML = e;
    gl.uniform1f(gl.getUniformLocation(program, "lightEmission"), e);
  };

  tetrahedron(va, vb, vc, vd, nrOfSubdivisions);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var diffuseProduct = mult(lightDiffuse, materialDiffuse);

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

  gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
  gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

  document.getElementById("incrementButton").onclick = function() {
    if (nrOfSubdivisions < 4)
      nrOfSubdivisions++;
    index = 0;
    points = [];
    normals = [];
    main();
  };

  document.getElementById("decrementButton").onclick = function() {
    if (nrOfSubdivisions > 0)
      nrOfSubdivisions--;
    index = 0;
    points = [];
    normals = [];
    main();
  };

  inrender++;

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta += 0.02;
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);
    eye = vec3(Math.cos(theta) * 5.0, 0.0, Math.sin(theta) * 5.0);

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    var normMat = normalMatrix(modelViewMatrix, true);

    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normMat));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    for (var i = 0; i < index; i += 3) {
      gl.drawArrays(gl.TRIANGLES, i, 3);
    }
    window.requestAnimFrame(render);
  }

  if (inrender < 2) {
    render();
  }
}