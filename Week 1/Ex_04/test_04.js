window.onload = function main() {
  var canvas = document.getElementById("glCanvas");
  // Initialize the GL context
  gl = WebGLUtils.setupWebGL(canvas);

  // Only continue if WebGL is available and working
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  theta = 0.0;

  vertices = [
      vec2( 0 , 0.5 ),
      vec2(  0.5 ,  0 ),
      vec2(  -0.5 , 0.0 ),
      vec2(  0,  -0.5),
  ];
  
  

 

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


thetaLoc = gl.getUniformLocation(program, "theta");




setInterval(render,5);



}



function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    theta += 0.01;
    gl.uniform1f(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, vertices.length );
    //reuestAnimFrame(render);
    
}
