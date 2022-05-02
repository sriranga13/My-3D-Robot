

"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];
var colors2 = [];

var key_flag = false;

//General cube
var cube_vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];


// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


// Parameters controlling the size of the robot
var BASE_HEIGHT     = 6.0;
var BASE_WIDTH      = 5.0;
var HEAD_HEIGHT     = 3.0;
var HEAD_WIDTH      = 3.0;
var ANTENNA_HEIGHT  = 3.0;
var ANTENNA_WIDTH   = 0.5;
var ARM_WIDTH       = 1.0;
var ARM_HEIGHT      = 5.0;

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;

var theta = [ 0, 0, 0]; //Rotation
var cam = [1,3,3];     //Initial camera position
var distance_scale = 1;

var modelViewMatrixLoc;

var vBuffer;
var buffers = [];

var event = 
{
    blink : {val : false, var : 1.0},
    wave : {val : false, var : 0.0},
    colors : {val : false},
    jump : {val : false, var : 0.0},
    turn : {val : false, var : 0.0},
};

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d, clrs, alt, vertices ) {
    colors.push(vertexColors[clrs[0]]);
    points.push(vertices[a]);
    colors.push(vertexColors[clrs[1]]);
    points.push(vertices[b]);
    colors.push(vertexColors[clrs[2]]);
    points.push(vertices[c]);
    colors.push(vertexColors[clrs[3]]);
    points.push(vertices[a]);
    colors.push(vertexColors[clrs[4]]);
    points.push(vertices[c]);
    colors.push(vertexColors[clrs[5]]);
    points.push(vertices[d]);

    colors2.push(vertexColors[alt[0]]);
    colors2.push(vertexColors[alt[1]]);
    colors2.push(vertexColors[alt[2]]);
    colors2.push(vertexColors[alt[3]]);
    colors2.push(vertexColors[alt[4]]);
    colors2.push(vertexColors[alt[5]]);
}

function eye() {
    quad( 1, 0, 3, 2, [3,3,3,3,3,3], [4,5,5,5,4,5], cube_vertices );
    quad( 2, 3, 7, 6, [3,3,3,3,3,3], [4,5,5,5,4,5], cube_vertices );
    quad( 3, 0, 4, 7, [3,3,3,3,3,3], [5,5,5,5,5,5], cube_vertices );
    quad( 6, 5, 1, 2, [3,3,3,3,3,3], [5,5,5,5,5,5], cube_vertices );
    quad( 4, 5, 6, 7, [3,3,3,3,3,3], [5,5,5,5,5,5], cube_vertices );
    quad( 5, 4, 0, 1, [3,3,3,3,3,3], [5,5,5,5,5,5], cube_vertices );
}

function body() {
    //Body of the robot
    var body_vertices = [
            vec4( -0.25, -0.25,  0.25, 1.0),
            vec4( -0.5,  0.5,  0.5, 1.0), 
            vec4( 0.5,  0.5,  0.5, 1.0), 
            vec4( 0.25, -0.25,  0.25, 1.0),
            vec4( -0.25, -0.25, -0.25, 1.0), //
            vec4( -0.5,  0.5, -0.5, 1.0), //
            vec4( 0.5,  0.5, -0.5, 1.0), //
            vec4( 0.25, -0.25, -0.25, 1.0)//
    ];
    quad( 1, 0, 3, 2, [1,5,4,1,4,7], [1,1,1,1,1,1], body_vertices );
    quad( 2, 3, 7, 6, [1,5,4,1,4,7], [3,3,3,3,3,3], body_vertices );
    quad( 3, 0, 4, 7, [1,5,4,1,4,7], [4,4,4,4,4,4], body_vertices );
    quad( 6, 5, 1, 2, [1,5,4,1,4,7], [7,7,7,7,7,7], body_vertices );
    quad( 4, 5, 6, 7, [1,5,4,1,4,7], [3,3,3,3,3,3], body_vertices );
    quad( 5, 4, 0, 1, [1,5,4,1,4,7], [4,4,4,4,4,4], body_vertices );
}

function cube() {
    quad( 1, 0, 3, 2, [1,5,4,1,4,7], [1,1,1,1,1,1], cube_vertices );
    quad( 2, 3, 7, 6, [1,5,4,1,4,7], [3,3,3,3,3,3], cube_vertices );
    quad( 3, 0, 4, 7, [1,5,4,1,4,7], [4,4,4,4,4,4], cube_vertices );
    quad( 6, 5, 1, 2, [1,5,4,1,4,7], [2,2,2,2,2,2], cube_vertices );
    quad( 4, 5, 6, 7, [1,5,4,1,4,7], [3,3,3,3,3,3], cube_vertices );
    quad( 5, 4, 0, 1, [1,5,4,1,4,7], [4,4,4,4,4,4], cube_vertices );
}

function input()
{
	document.getElementById("slider1").onchange = function(event) { theta[0] = event.target.value;  };
    document.getElementById("slider2").onchange = function(event) { theta[1] = event.target.value;  };
    document.getElementById("slider3").onchange = function(event) { theta[2] =  event.target.value; };
    document.getElementById("slider4").onchange = function(event) { cam[0] = event.target.value;    };
    document.getElementById("slider5").onchange = function(event) { cam[1] = event.target.value;    };
    document.getElementById("slider6").onchange = function(event) { cam[2] =  event.target.value;   };
    document.getElementById("slider6").onchange = function(event) { cam[2] =  event.target.value;   };
    document.getElementById("distance").onchange = function(event) { distance_scale = event.target.value; };
    //document.getElementById("bt").onclick = function(a) {event.jump.val = true;};

    document.addEventListener('keyup', function(e) 
    {
        if(!key_flag)
        { 
            key_flag = true;
            console.log(String.fromCharCode(e.keyCode));
            switch(String.fromCharCode(e.keyCode).toLowerCase())
            {
                case "b": event.blink.val = true; break;
                case "c": event.colors.val ^= 1; break;
                case "j": event.jump.val = true; break;
                case "t": event.turn.val = true; break;
                case "w": event.wave.val = true; break;
                case "q": alert("Program complete. Please exit."); window.stop();
            }
        }
    });
    document.addEventListener('keydown',function(e){key_flag = false;});
}

//----------------------------------------------------------------------------


function base() {
    var s = scalem(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult( translate( 0.0, -0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 36, NumVertices );
}

//----------------------------------------------------------------------------


function antenna() {
    var s = scalem(ANTENNA_WIDTH, ANTENNA_HEIGHT, ANTENNA_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * ANTENNA_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------
function head()
{
    var s = scalem(HEAD_WIDTH, HEAD_HEIGHT, HEAD_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * HEAD_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------
function right_limb(arm) {
    var wave_formula = 0;
    if(event.wave.val && arm)
    {
        wave_formula = 200*Math.sin((1/64)*event.wave.var)
                    +((200*Math.sin(3*(1/64)*event.wave.var))/3) 
                    +((200*Math.sin(5*(1/64)*event.wave.var))/5) 
                    +((200*Math.sin(7*(1/64)*event.wave.var))/3);
        ++event.wave.var;
        if(wave_formula < 0)
        {
            event.wave.var = 0;
            wave_formula = 0; 
            event.wave.val = false;
        }
    }

    var s = scalem(ARM_WIDTH, ARM_HEIGHT, ARM_WIDTH);
    var instanceMatrix = mult(rotate(wave_formula,-2.5,-0.6,0),s);
    instanceMatrix  = mult(instanceMatrix, translate( -2.5, -0.6, 0.0 ));    
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function left_limb() {
    var s = scalem(ARM_WIDTH, ARM_HEIGHT, ARM_WIDTH);
    var instanceMatrix = mult(rotate(10,0,0,1),s);
    instanceMatrix  = mult(instanceMatrix, translate( 2.5, -0.6, 0.0 ));    
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function eyes()
{ 
    if(event.blink.val) event.blink.var -= 0.01;
    if(Math.abs(event.blink.var) > 1.0)
    { 
        event.blink.var = 1.0;
        event.blink.val = false;
    }

    var s = scalem(0.5,event.blink.var,0.5);
    var instanceMatrix = mult( translate( 0.0, 0.5 * HEAD_HEIGHT, 1.5 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 72, NumVertices );
}

var render = function() {
    input();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffers[event.colors.val?1:0] );
    gl.vertexAttribPointer( gl.getAttribLocation( program, "vColor" ), 4, gl.FLOAT, false, 0, 0 );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    modelViewMatrix = mat4(1); 
    modelViewMatrix = mult(modelViewMatrix, lookAt([cam[0],cam[1],cam[2]],[0,0,0],[0,1,0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[0], 1, 0, 0 ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[1], 0, 1, 0 ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[2], 0, 0, 1 ));
    modelViewMatrix = mult(modelViewMatrix, scalem(distance_scale,distance_scale,distance_scale));

    if(event.turn.val) if(++event.turn.var%180 == 0) event.turn.val =  false;
    modelViewMatrix = mult(modelViewMatrix, rotate(event.turn.var, 0, 1, 0 ));

    var offset = 0;

    if(event.jump.val) 
    {
        let t = 3*Math.sin((1/16)*event.jump.var++)
        offset = t < 0 ? 0 : t;
        if(t < 0) 
        {
            event.jump.val = false;
            event.jump.var = 0.0;
        }
    }

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, 3+offset, 0.0));
    base();

    var a = modelViewMatrix;

    head();
    modelViewMatrix = mult(modelViewMatrix, translate(-1,0,0));
    eyes();
    modelViewMatrix = mult(modelViewMatrix, translate(2,0,0));
    eyes();
    modelViewMatrix = a;

    modelViewMatrix  = mult(modelViewMatrix, translate(-1.0, HEAD_HEIGHT-1, 0.0));
    var temp = modelViewMatrix;
    modelViewMatrix  = mult(modelViewMatrix, rotate(12, 0, 0, 1) );
    antenna();
    modelViewMatrix = temp;
    modelViewMatrix  = mult(modelViewMatrix, translate(2.0, 0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-12, 0, 0, 1) );
    antenna();

    modelViewMatrix = a;
    right_limb(true);
    left_limb();

    modelViewMatrix = mult(a, translate(-2,-BASE_HEIGHT+2,0));
    left_limb();
    modelViewMatrix = mult(modelViewMatrix, translate(4,0,0));
    right_limb(false);

    requestAnimFrame(render);
}

//____________________________________________

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    cube();
    body();
    eye();

    // Load shaders and use the resulting shader program
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects
    //VBO
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    buffers[0] = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffers[0] );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    buffers[1] = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffers[1] );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors2), gl.STATIC_DRAW );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    render();
}
