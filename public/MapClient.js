// Execute animation
$(document).ready(function() {
	startAnimating(10);
});

// Size of single cell in maze
var cellsWide;
var cellsHigh;

// Arrays to handle maze
var maze = [];
var mazeStart = {};
var mazeEnd = {};

// Connection and array to store new sockets(players)
var socket = io.connect("http://localhost:8081");
var player = [];
var x = 0;
var y = 0;

// Player animation variables
var fpsInterval;
var then;
var shift = 0;					// x location in canvas to locate sprite
var frameWidth = 107;  	// Sprite Width in sheet
var frameHeight = 140; 	// Sprite Height in sheet
var totalFrames = 8; 		// Number of images in sprite sheet
var currentFrame = 0; 	// Start rendering animation from first image in sheet

// Player animation storage
var img = document.createElement("img");
img.src="resources/player.png";

// Socket listening for new maze settings
socket.on("maze data", function(data) {
	cellsWide = data.mazeSize.cols;
	cellsHigh = data.mazeSize.rows;
	maze = data.mazeCells;
	mazeStart = data.mazeStart;
	mazeEnd = data.mazeEnd;
});

// Socket to inform server about new key stroke from player
socket.emit("New Player");
$(document).keypress(function(event){
	socket.emit("key",event.key);
});

// Socket listening for new player settings
socket.on("New Player",function(players){
	for(var id in players){
		player[id] =({
			x:players[id].x,
			y:players[id].y
		});
	}
});

// Socket listening for player disconnection and removing him from array
socket.on("Disconnected",function(disPlayer){
 delete player[disPlayer];
});

// Function handling refresh rate
function startAnimating(fps) {
	fpsInterval = 1000/fps;
	then = Date.now();
	animate();
}

// Function drawing new player animation
function drawPlayer(player,x,y){
	var canvas = $("canvas").get(0);
	var context = canvas.getContext("2d");
	context.drawImage
	(
		img, 						//image source
		shift, 					// x position in sprite sheet to look for image
		0,							// y position in sprite sheet to look for image
		frameWidth, 		// width of sprite in sprite sheet
		frameHeight, 		// height of sprite in sprite sheet
		(player.x)*x, 	// x location on canvas(player.x) (Multiplied by width of cell (x))
		(player.y)*y, 	// y location on canvas(player.y) (Multiplied by height of cell (y))
		x, 							// sprite width on canvas
		y 							// sprite height on canvas
	);
}

// Function handling all animation happening on the canvas (players/maze)
function animate() {
	var now = Date.now();
	var elapsed = now - then;

	if (elapsed > fpsInterval) {
		then = now - (elapsed % fpsInterval);
		var canvas = $("canvas").get(0);
		var context = canvas.getContext("2d");
		var cellWidth = canvas.width/cellsWide;
		var cellHeight = canvas.height/cellsHigh;

		// Clear canvas
		context.clearRect(0, 0, canvas.width, canvas.height);

		// Render finish line
		context.fillStyle = "yellow";
		context.fillRect(mazeEnd.x * cellWidth,
						 mazeEnd.y * cellHeight,
						 cellWidth, cellHeight);

		// Loop through players array and render them
		for(var id in player){
			drawPlayer(player[id],cellWidth,cellHeight);
			//context.drawImage(img,shift,0,frameWidth,frameHeight,(player[id].x)*cellWidth,(player[id].y)*cellHeight,cellWidth,cellHeight);
		}

		// Once first image is rendered look for another one (sprite width + 1)
		shift += frameWidth + 1;
		currentFrame++;

		// Once all images are rendered go back to the first one (constant loop)
		if (currentFrame == totalFrames) {
			shift = 0;
			currentFrame = 0;
		}


		// Render maze
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
