window.onload = function main() {
  var canvas = document.getElementById("glCanvas");

  // Initialize the GL context
  gl = WebGLUtils.setupWebGL(canvas);

  // Only continue if WebGL is available and working
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  index = 0;
  subdivideValue = 0;
  drawCircle = 0;

  pointsArray = [];

  va = vec4(0.0,0.0,1.0,1);
  vb = vec4(0.0,0.942809,-0.3333333,1);
  vc = vec4(-0.816497,-0.471405,-0.333333,1);
  vd = vec4(0.816497,-0.471405,-0.333333,1);

  tetrahedron(va,vb,vc,vd,subdivideValue);
  console.log(pointsArray);

  p = perspective(55,1,1e-3,1e3);

  m = lookAt(vec3(0.5, 0.5, 5),vec3(0.5,0.5,0),vec3(0,1,0));
  rotationMatrix = mult(p,m);
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");

  gl.viewport(0, 0, canvas.width, canvas.height);
  // Set clear color to black, fully opaque
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  // Clear the color buffer with specified clear color

  bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  console.log(index);
  render();
};


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

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(rotationMatrix));
  gl.drawArrays( gl.TRIANGLES, 0, index);
  //gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_BYTE, 0);
  window.requestAnimFrame(render);
}


function getMoveMatrix(x,z,y){
  return [
    1, 0, 0, x,
    0, 1, 0, y,
    0, 0, 1, z,
    0, 0, 0, 1
  ];
}

function tetrahedron(a,b,c,d,n)
{
  divideTriangle(a,b,c,n);
  divideTriangle(d,c,b,n);
  divideTriangle(a,d,b,n);
  divideTriangle(a,c,d,n);
}

function triangle(a,b,c){
  pointsArray.push(a);
  pointsArray.push(b);
  pointsArray.push(c);
  index += 3;
}

function divideTriangle(a,b,c,count){

  if (count > 0){
    var ab = normalize(mix(a,b,0.5),true);
    var ac = normalize(mix(a,c,0.5),true);
    var bc = normalize(mix(b,c,0.5),true);

    divideTriangle(a,ab,ac,count-1);
    divideTriangle(ab,c,bc,count-1);
    divideTriangle(bc,c,ac,count-1);
    divideTriangle(ab,bc,ac,count-1);
  }
  else{
    triangle(a,b,c);
  }
}

function increment() {
  pointsArray = [];
  index = 0;
  subdivideValue++;
  drawCircle = index;
  tetrahedron(va, vb, vc, vd, subdivideValue);
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}

function decrement() {
  if (subdivideValue > 0) {
    subdivideValue--;
    pointsArray = [];
    index = 0;
    drawCircle = index;
    tetrahedron(va, vb, vc, vd, subdivideValue);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
  }
}