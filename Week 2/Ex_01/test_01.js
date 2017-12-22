window.onload = function main() {
  var canvas = document.getElementById("glCanvas");
  // Initialize the GL context
  gl = WebGLUtils.setupWebGL(canvas);

  // Only continue if WebGL is available and working
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  var index = 0;


  vertices = [
      vec2( 1 , 0 ),
      vec2(  0,  0 ),
      vec2(  1, 1 )
  ];

canvas.addEventListener("click",function() {

  gl.bindBuffer(gl.ARRAY_BUFFER,bufferId);
  var correction = event.target.getBoundingClientRect();
  var t = vec2(-1 + 2*(event.clientX-correction.left)/canvas.width,
               -1 + 2*(canvas.height - event.clientY + correction.top)/canvas.height);
  
  vertices.push(t);
  gl.bufferSubData(gl.ARRAY_BUFFER,sizeof['vec2']*index,flatten(t));
  index++;
});


  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

  gl.viewport(0, 0, canvas.width, canvas.height);
  // Set clear color to black, fully opaque
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  // Clear the color buffer with specified clear color



var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, sizeof["vec2"]*1000, gl.STATIC_DRAW );
    gl.bufferSubData(gl.ARRAY_BUFFER,index*sizeof["vec2"],flatten(vertices));
    index += 3;


    // Associate out shader variables with our data buffer

var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

render();

}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, vertices.length );
    window.requestAnimFrame(render);
}
