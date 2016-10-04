"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 3;

var index = 0;

var pointsArray = [];
var normalsArray = [];

var near = -10;
var far = 10;
var radius = 2.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var lightPosition = vec4(0.0, 0.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var phongFragmentShading = false;

window.onload = function init() {


        var program = initShaders(gl, "vertex-shader", "fragment-shader");

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    //establishes points on sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );



    //LIGHT PROPERTIES
    document.getElementById("lightAmbientRed").onchange = function(event) {
        lightAmbient[0] = event.target.value;
        document.getElementById("lightAmbientRedText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("lightAmbientGreen").onchange = function(event) {
        lightAmbient[1] = event.target.value;
        document.getElementById("lightAmbientGreenText").innerHTML = event.target.value;
        init();
    }
     document.getElementById("lightAmbientBlue").onchange = function(event) {
        lightAmbient[2] = event.target.value;
        document.getElementById("lightAmbientBlueText").innerHTML = event.target.value;
        init();
    }
    document.getElementById("lightDiffuseRed").onchange = function(event) {
        lightDiffuse[0] = event.target.value;
        document.getElementById("lightDiffuseRedText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("lightDiffuseGreen").onchange = function(event) {
        lightDiffuse[1] = event.target.value;
        document.getElementById("lightDiffuseGreenText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("lightDiffuseBlue").onchange = function(event) {
        lightDiffuse[2] = event.target.value;
        document.getElementById("lightDiffuseBlueText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("lightSpecularRed").onchange = function(event) {
        lightSpecular[0] = event.target.value;
        document.getElementById("lightSpecularRedText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("lightSpecularGreen").onchange = function(event) {
        lightSpecular[1] = event.target.value;
        document.getElementById("lightSpecularGreenText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("lightSpecularBlue").onchange = function(event) {
        lightSpecular[2] = event.target.value;
        document.getElementById("lightSpecularBlueText").innerHTML = event.target.value;
        init();
    };

    //MATERIAL PROPERTIES
    document.getElementById("materialAmbientRed").onchange = function(event) {
        materialAmbient[0] = event.target.value;
        document.getElementById("materialAmbientRedText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("materialAmbientGreen").onchange = function(event) {
        materialAmbient[1] = event.target.value;
        document.getElementById("materialAmbientGreenText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("materialAmbientBlue").onchange = function(event) {
        materialAmbient[2] = event.target.value;
        document.getElementById("materialAmbientBlueText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("materialDiffuseRed").onchange = function(event) {
        materialDiffuse[0] = event.target.value;
        document.getElementById("materialDiffuseRedText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("materialDiffuseGreen").onchange = function(event) {
        materialDiffuse[1] = event.target.value;
        document.getElementById("materialDiffuseGreenText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("materialDiffuseBlue").onchange = function(event) {
        materialDiffuse[2] = event.target.value;
        document.getElementById("materialDiffuseBlueText").innerHTML = event.target.value;
        init();
    };
       document.getElementById("materialSpecularRed").onchange = function(event) {
        materialSpecular[0] = event.target.value;
        document.getElementById("materialSpecularRedText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("materialSpecularGreen").onchange = function(event) {
        materialSpecular[1] = event.target.value;
        document.getElementById("materialSpecularGreenText").innerHTML = event.target.value;
        init();
    };
     document.getElementById("materialSpecularBlue").onchange = function(event) {
        materialSpecular[2] = event.target.value;
        document.getElementById("materialSpecularBlueText").innerHTML = event.target.value;
        init();
    };
    document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = event.target.value;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };
    document.getElementById("shininess").onchange = function(event){
        materialShininess = event.target.value;
        document.getElementById("shininessText").innerHTML = event.target.value;
        init();
    };

    document.getElementById("phi").onchange = function(event){
        phi = event.target.value;
        document.getElementById("phiText").innerHTML = event.target.value;
        init();
    };

    document.getElementById("theta").onchange = function(event){
        theta = event.target.value;
        document.getElementById("thetaText").innerHTML = event.target.value;
        init();
    };

    document.getElementById("Controls").onclick = function(event){
        switch(event.target.index){
            case 0:
                phongFragmentShading = false;
                break;
            case 1:
                phongFragmentShading = true;
                break;
        }
        init();
    };
 
    lightPosition[0] = radius*Math.sin(theta);
    lightPosition[1] = radius*Math.sin(phi);
    lightPosition[2] = radius;


    gl.uniform4fv( gl.getUniformLocation(program, 
        "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(0,0,1.5);

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}
