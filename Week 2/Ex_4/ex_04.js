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
  selected = 0;
  triCounter = 0;
  cirCounter = 0;
  cirPoints = 100;

  indexArrayPoints = [];
  indexArrayTri = [];
  indexArrayCir = [];
  verticesPoints = [];
  verticesTri = [];
  verticesCir = [];
  colors = [];
  chosenColor = [0, 0, 0, 1]


  canvas.addEventListener("click", function() {

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    var correction = event.target.getBoundingClientRect();
    var t = vec2(-1 + 2 * (event.clientX - correction.left) / canvas.width, -1 + 2 * (canvas.height - event.clientY + correction.top) / canvas.height);

    if (selected == 0) { // draw points
      verticesPoints.push(t);
      gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, flatten(t));
      gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
      gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec4'] * index, flatten(chosenColor));
      indexArrayPoints.push(index);
      index++;


    } else if (selected == 1) { // draw triangles
      verticesTri.push(t);
      gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, flatten(t));
      gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
      gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec4'] * index, flatten(chosenColor));

      if (triCounter == 2) {

        indexArrayPoints.pop();
        indexArrayTri.push(indexArrayPoints[indexArrayPoints.length - 1]);
        indexArrayPoints.pop();
        triCounter = 0;

      } else {
        indexArrayPoints.push(index);
        triCounter++;
      }

      index++;
    } else if (selected == 2) { // draw circles    
      verticesCir.push(t);
      gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, flatten(t));
      gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
      gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec4'] * index, flatten(chosenColor));

      if (cirCounter == 1) {

        indexArrayCir.push(indexArrayPoints[indexArrayPoints.length - 1]);

        cirCounter = 0;
        centerPoint = verticesCir[verticesCir.length - 2];

        length = Math.sqrt((t[0] - centerPoint[0]) * (t[0] - centerPoint[0]) + (t[1] - centerPoint[1]) * (t[1] - centerPoint[1]));

        for (var i = 0; i >= 100; i++) {

          var pointX = length * Math.cos(theta) + centerPoint[0];
          var pointY = length * Math.sin(theta) + centerPoint[1];

          theta += 0.1;

          gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
          var t = vec2(pointX, pointY);

          verticesCir.push(t);
          gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, flatten(t));
          gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
          gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec4'] * index, flatten(chosenColor));

          index++;


        }

        indexArrayPoints.pop();

      } else {

        indexArrayPoints.push(index);
        cirCounter++;

      }
      index++;
    }
  });

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  gl.viewport(0, 0, canvas.width, canvas.height);
  // Set clear color to black, fully opaque
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  // Clear the color buffer with specified clear color

  var cBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferData(gl.ARRAY_BUFFER, sizeof["vec4"] * 1000, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof["vec4"], flatten(colors));

  // Associate out shader variables with our data buffer

  var bColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(bColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(bColor);


  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, sizeof["vec2"] * 1000, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof["vec2"], flatten(verticesPoints));


  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();

}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (index > 0) {
    for (var i = 0; i < index; i++) {
      if (indexArrayPoints.includes(i)) {
        gl.drawArrays(gl.POINTS, i, 1);
      } else if (indexArrayTri.includes(i)) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
      } else if (indexArrayCir.includes(i)) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 101);
      }
    }
  }
  window.requestAnimFrame(render);
}

function clearCanvas() {
  index = 0;
  gl.clearColor(chosenColor[0], chosenColor[1], chosenColor[2], chosenColor[3]);
}

function selectMode(i) {
  selected = i;
}