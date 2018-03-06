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
//Comment out above and remove coment below to play over (my)home network.
//var socket = io.connect("192.168.0.5:8081");
var player = [];
var x = 0;
var y = 0;

// Swipng
var swipe;

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

//Event when keyboard key is pressed
$(document).keypress(function(event){
	socket.emit("key",event.key);
});

//Event when control button is pressed
$(document).ready(function(){
	$("button").click(function() {
	     socket.emit("key",this.id);
});

//Game Log updates
//Update log upon player connection
socket.on("New Log Connected",function(text){
	$("#GameLog").append("<h1>Player "+text+" has Connected</h1>");
});

//Update log upon player disconnection
socket.on("New Log Disconnected",function(text){
	$("#GameLog").append("<h1>Player "+text+" has Disconnected</h1>");
	$("h1").first().remove()
});

socket.on("New Log Name",function(text){
	$("#GameLog").append("<h1>Player "+text.nameOld+" is now "+text.nameNew+"</h1>");
	$("h1").first().remove()
});

//Event when swiping on canvas
$("canvas").on("swiperight",function() {
		swipe = "d";
		socket.emit("key",swipe);
		})
		.on("swipeleft",function(){
			swipe = "a";
			socket.emit("key",swipe);
		})
		.on("swipeup",function(){
			swipe = "w";
			socket.emit("key",swipe);
		})
		.on("swipedown",function(){
			swipe = "s";
			socket.emit("key",swipe);
});


	//Event to change name
	$("#nameSubmit").click(function(){
			var playerColor = $("#colorPicker").val();
			var name = $("#nameInput").val();
			socket.emit("newName",{name,playerColor});
	});
});

// Socket listening for new player settings
socket.on("New Player",function(players){
	for(var id in players){
		player[id] =({
			x:players[id].x,
			y:players[id].y,
			name:players[id].name,
			color:players[id].color
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
	context.fillStyle = player.color;
	context.font="15px Arial";
	//Player Name , X pos, Y pos + sprite Y pos
	context.fillText(player.name,(player.x)*x,(player.y)*y + y);
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
