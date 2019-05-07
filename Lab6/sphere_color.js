"use strict";

var canvas;
var gl;
var program;

// rows and columns 
var nRows = 30;
var nColumns = 30;

// point array and color array
var pointsArray = [];
var colors = [];

// eye position 
var radius = 6;
var theta  = 0.5;
var phi    = 0.0;

// step change
var dr = 5.0 * Math.PI/180.0;

// ortho projection 
var near = -10;
var far = 10;
var left = -1.5;
var right = 1.5;
var ytop = 1.5;
var bottom = -1.5;

// model-view
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// connect to html
var colorFlagLoc;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// basic colors
const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);
const blue = vec4(0.0,0.0,1.0,1.0);
const green = vec4(0.0,0.5,0.0,1.0);
const magenta = vec4(1.0, 0.0, 1.0, 1.0);
const yellow = vec4(1.0, 1.0, 0.0, 1.0);
const orange = vec4(1.0,165/255,0.0,1.0);

// default type and colormap
var type = "surface";
var colormap = "spring";

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    // add positions and colors of points 
    addpoints(type);

    // Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // push point array and color array in buffers
    initialize()

    // connect
    colorFlagLoc = gl.getUniformLocation(program, "colorFlag");
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // buttons for moving viewer and changing size
    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near  *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){radius *= 2.0;};
    document.getElementById("Button4").onclick = function(){radius *= 0.5;};
    document.getElementById("Button5").onclick = function(){theta += dr;};
    document.getElementById("Button6").onclick = function(){theta -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};
    document.getElementById("Button9").onclick = function(){left  *= 0.9; right *= 0.9;};
    document.getElementById("Button10").onclick = function(){left *= 1.1; right *= 1.1;};
    document.getElementById("Button11").onclick = function(){ytop  *= 0.9; bottom *= 0.9;};
    document.getElementById("Button12").onclick = function(){ytop *= 1.1; bottom *= 1.1;};

    var menu1 = document.getElementById("menu1");
    menu1.addEventListener("change", function(){
        switch (menu1.selectedIndex){
            case 0:
                type = "surface";
                addpoints(type);
                initialize();
                break;
            case 1:
                type = "mesh"
                addpoints(type);
                initialize();
                break;
        }
    })

    var menu2 = document.getElementById("menu2");
    menu2.addEventListener("change", function(){
        switch (menu2.selectedIndex){
            case 0:
                colormap = "spring";
                addpoints(type);
                initialize();
                break;
            case 1:
                colormap = "summer";
                addpoints(type);
                initialize();
                break;
            case 2:
                colormap = "autumn";
                addpoints(type);
                initialize();
                break;
            case 3:
                colormap = "winter";
                addpoints(type);
                initialize();
                break;


        }
    })

    document.getElementById( "row" ).onclick = function () {
        nRows = document.getElementById('input1').value;
        addpoints(type);
        initialize();
    };
    document.getElementById( "column" ).onclick = function () {
        nColumns = document.getElementById('input2').value;
        addpoints(type);
        initialize();
    };

    render();
}

function initialize(){
    //
    //  Load shaders and initialize attribute buffers
    //
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
}

function addpoints() {
    var r_data = 1.0;

    // mesh points
    if(type == "mesh"){
        // Do not use theta and phi again since you have use these names for specifying eye position.
        var theta_data, phi_data;  
        pointsArray = [];
        colors = [];
        // push positions and colors of points horizontally and vertically 
        // your code goes here
        var data = new Array(nRows);
        for(var i = 0; i < nRows; i++) data[i] = new Array(nColumns);


        for(var i = 0; i < nRows; i++)
        {
        	theta_data = Math.PI * (i/(nRows-1) - 1/2);

        	for(var j = 0; j < nColumns; j++)
        	{

        		phi_data = 2 * Math.PI * (j/(nColumns - 1));
        		var temp = get_xyz(r_data, theta_data, phi_data);
        		data[i][j] = temp;
        		
        	}
        }

        for(var i = 0; i < nRows; i++)
        {
        	var color = find_color(colormap, i/nRows);
        	for(var j = 0; j < nColumns; j++)
        	{
        		pointsArray.push(data[i][j]);
        		colors.push(color);
        	}	
        }

        for(var j = 0; j < nColumns; j++)
        {
        	for(var i = 0; i < nRows; i++)
        	{
        		var color = find_color(colormap, i/nRows);
        		pointsArray.push(data[i][j]);
        		colors.push(color);	
        	}	
        }
        console.log(pointsArray.length);

    }
    // "surface"
    else if(type = "surface"){
        var theta_data1, theta_data2, phi_data1, phi_data2;
        pointsArray = [];
        colors = [];
        // push positions and colors of points square by square 
        // your code goes here
        for(var i = 0; i < nRows - 1; i++)
        {
        	theta_data1 = Math.PI * (i/(nRows-1) - 1/2);
        	theta_data2 = Math.PI * ((i + 1)/(nRows-1) - 1/2);
        	var color = find_color(colormap, i/nRows);

        	for(var j = 0; j < nColumns - 1; j++)
        	{
        		phi_data1 = 2 * Math.PI * (j/(nColumns - 1));
        		phi_data2 = 2 * Math.PI * ((j + 1)/(nColumns - 1));
        		var temp = get_xyz(r_data, theta_data1, phi_data1);
        		var temp1 = get_xyz(r_data, theta_data2, phi_data1);
        		var temp2 = get_xyz(r_data, theta_data2, phi_data2);
        		var temp3 = get_xyz(r_data, theta_data1, phi_data2);
        		pointsArray.push(temp);
        		colors.push(color);
        		pointsArray.push(temp1);
        		colors.push(color);
        		pointsArray.push(temp2);
        		colors.push(color);
        		pointsArray.push(temp3);
        		colors.push(color);
        	}
        }




    }
}

// return color given a colormap and a ratio 
function find_color(colormap,ratio){
    switch (colormap){
        // from magenta to yellow
        case "spring":
            return mix(magenta, yellow, ratio);
        case "summer":
        	return mix(green, yellow, ratio);
        case "autumn":
        	if(ratio < 0.5)
        	{
        		return mix(red, orange, ratio * 2);
        	}
        	else
        	{
        		return mix(orange, yellow, (ratio - 0.5) * 2);
        	}
        	
        case "winter":
        	return mix(blue, green, ratio);
        // add your code here for other three colors
        // your code goes here:


        
    }
}

// return coordinate x,y,z given r,theta,phi
function get_xyz(r, theta, phi){
    return vec4(
        // your code goes here:
        r*Math.cos(theta)*Math.sin(phi),
        r*Math.sin(theta),
        r*Math.cos(theta)*Math.cos(phi),
        1.0
    );
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.cos(theta)*Math.sin(phi),
        radius*Math.sin(theta), radius*Math.cos(theta)*Math.cos(phi));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    
    if (type == "mesh"){
        // your code goes here:
        gl.uniform1i(colorFlagLoc, 0);
        for(var i = 0; i < nRows; i++) gl.drawArrays(gl.LINE_STRIP, i * nColumns, nColumns);
        for(var i = 0; i < nColumns; i++) gl.drawArrays(gl.LINE_STRIP, i * nRows + pointsArray.length/2, nRows);

    }
    else if (type == "surface"){
        // your code goes here:

        for(var i = 0; i < pointsArray.length; i+=4)
        {
        	
        	gl.uniform1i(colorFlagLoc, 0);
        	gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        	gl.uniform1i(colorFlagLoc, 1);
        	gl.drawArrays(gl.LINE_LOOP, i, 4);
        }

    }
    // console.log(pointsArray);
    requestAnimFrame(render);
}
