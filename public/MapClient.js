$(document).ready(function() {
	startAnimating(10);
});

var cellsWide;
var cellsHigh;

var maze = [];
var mazeStart = {};
var mazeEnd = {};
var socket = io.connect("http://localhost:8081");
var player = [];


var fpsInterval;
var then;
var shift = 0;
var frameWidth = 107;
var frameHeight = 140;
var totalFrames = 8;
var currentFrame = 0;
//Loading image
var img = document.createElement("img");
img.src="player.png";

socket.on("maze data", function(data) {
	cellsWide = data.mazeSize.cols;
	cellsHigh = data.mazeSize.rows;
	maze = data.mazeCells;
	mazeStart = data.mazeStart;
	mazeEnd = data.mazeEnd;
});
var x = 0;
var y = 0;

socket.emit("New Player");
$(document).keypress(function(event){
	socket.emit("key",event.key);
});

socket.on("New Player",function(players){
	for(var id in players){
		player[id] =({
			x:players[id].x,
			y:players[id].y
		});
	}
});

//When player disconnects remove him from canvas
socket.on("Disconnected",function(disPlayer){
 delete player[disPlayer];
});


function drawPlayer(x,y,cellWidth,cellHeight){
	var canvas = $("canvas").get(0);
	var context = canvas.getContext("2d");

	context.fillStyle = "red";
	context.fillRect(x * cellWidth,
					 y * cellHeight,
					 cellWidth, cellHeight);
}

function startAnimating(fps) {
	fpsInterval = 1000/fps;
	then = Date.now();
	animate();
}

function animate() {
	var now = Date.now();
	var elapsed = now - then;

	if (elapsed > fpsInterval) {
		then = now - (elapsed % fpsInterval);
		var canvas = $("canvas").get(0);
		var context = canvas.getContext("2d");

		var cellWidth = canvas.width/cellsWide;
		var cellHeight = canvas.height/cellsHigh;

		context.clearRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = "yellow";
		context.fillRect(mazeEnd.x * cellWidth,
						 mazeEnd.y * cellHeight,
						 cellWidth, cellHeight);

		for(var id in player){
			//drawPlayer(player[id].x,player[id].y,cellWidth,cellHeight);
			context.drawImage(img,shift,0,frameWidth,frameHeight,(player[id].x)*cellWidth,(player[id].y)*cellHeight,cellWidth,cellHeight);
		}
		shift += frameWidth + 1;
		currentFrame++;

		if (currentFrame == totalFrames) {
			shift = 0;
			currentFrame = 0;
		}

		context.fillStyle = "black";
		context.lineWidth = 2;
		for (i = 0; i < maze.length; i++) {

			for (j = 0; j < maze[i].length; j++) {

				if (maze[i][j].top) {
					context.beginPath();
					context.moveTo(maze[i][j].x*cellWidth, maze[i][j].y*cellHeight);
					context.lineTo((maze[i][j].x+1)*cellWidth,maze[i][j].y*cellHeight);
					context.stroke();
					context.closePath();
				}

				if (maze[i][j].right) {
					context.beginPath();
					context.moveTo((maze[i][j].x+1)*cellWidth,maze[i][j].y*cellHeight);
					context.lineTo((maze[i][j].x+1)*cellWidth,(maze[i][j].y+1)*cellHeight);
					context.stroke();
					context.closePath();
				}

				if (maze[i][j].bottom) {
					context.beginPath();
					context.moveTo((maze[i][j].x+1)*cellWidth,(maze[i][j].y+1)*cellHeight);
					context.lineTo(maze[i][j].x*cellWidth,(maze[i][j].y+1)*cellHeight);
					context.stroke();
					context.closePath();
				}

				if (maze[i][j].left) {
					context.beginPath();
					context.moveTo(maze[i][j].x*cellWidth,(maze[i][j].y+1)*cellHeight);
					context.lineTo(maze[i][j].x*cellWidth, maze[i][j].y*cellHeight);
					context.stroke();
					context.closePath();
				}
			}
		}
	}
	requestAnimationFrame(animate);
}
