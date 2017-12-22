window.onload = function main() {
  var canvas = document.getElementById("glCanvas");
  // Initialize the GL context
  gl = WebGLUtils.setupWebGL(canvas);

  // Only continue if WebGL is available and working
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  theta = 0;
  length = 0.5;
  move = 0;

  vertices = [ vec2( 0 , 0 ) ];
  
 createVertices(100);

  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  gl.viewport(0, 0, canvas.width, canvas.height);
  // Set clear color to black, fully opaque
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  // Clear the color buffer with specified clear color

var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

moveLoc = gl.getUniformLocation(program, "move");

render();
}

function createVertices(nrOfVertices) {
  for (var i = 0; i < nrOfVertices; i++) {
    vertices.push(vec2(length*Math.cos(theta),length*Math.sin(theta)));
    theta += 0.1;
  }

}



function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    move += 0.1;
    gl.uniform1f(moveLoc, move);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length );
    requestAnimFrame(render);
    
}
