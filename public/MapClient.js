/* These two variables control how many cells we divide the canvas into
 * horizontally (cellsWide) and vertically (cellsHigh).
 * They are used in the graphics calculations later, to establish the
 * size of each cell 'on the fly' so that they can change dynamically.
 *
 * They are set upon receipt of the 'maze data' message.
 */
var cellsWide;
var cellsHigh;

/* These three variables hold information about the maze.
 * - maze, a two-dimensional array of objects each containing members:
 * -- x, an integer describing the horizontal position of the cell
 * -- y, an integer the vertical position of the cell
 * -- top, a boolean describing whether the top edge of the cell has a wall
 * -- bottom, a boolean describing whether the bottom edge of the cell has a wall
 * -- left, a boolean describing whether the left edge of the cell has a wall
 * -- right, a boolean describing whether the right edge of the cell has a wall
 * -- set, an integer used in maze generation that can safely be ignored
 *
 * - mazeStart
 * -- x, the row at which players should start in the maze
 * -- y, the column at which players should start in the maze
 *
 * - mazeEnd
 * -- x, the row where the goal space of the maze is located
 * -- y, the column where the goal space of the maze is located
 *
 * These variables are all initialised, and changed, upon receipt of the 'maze data' message.
 */
var maze = [];
var mazeStart = {};
var mazeEnd = {};

/*
 * Establish a connection to our server
 * We will need to reuse the 'socket' variable to both send messages
 * and receive them, by way of adding event handlers for the various
 * messages we expect to receive
 *
 * Replace localhost with a specific URL or IP address if testing
 * across multiple computers
 *
 * See Real-Time Servers III: socket.io and Messaging for help understanding how
 * we set up and use socket.io
 *
 */
var socket = io.connect("http://192.168.0.7:8081");

/*
 * This is the event handler for the 'maze data' message
 * When a 'maze data' message is received from the server, this block of code executes
 *
 * The server is sending us either initial information about a maze, or,
 * updated information about a maze, and so we want to replace our existing
 * maze variables with the new information.
 *
 * We know the specification of the information we receive (from the documentation
 * and design of the server), and use this to help write this handler.
 */
socket.on("maze data", function(data) {
	cellsWide = data.mazeSize.cols;
	cellsHigh = data.mazeSize.rows;
	maze = data.mazeCells;
	mazeStart = data.mazeStart;
	mazeEnd = data.mazeEnd;
});

/*
 * Once our page is fully loaded and ready, we call startAnimating
 * to kick off our animation loop.
 * We pass in a value - our fps - to control the speed of our animation.
 */
$(document).ready(function() {
	startAnimating(60);
});

/*
 * The startAnimating function kicks off our animation (see Games on the Web I - HTML5 Graphics and Animations).
 */
function startAnimating(fps) {
	fpsInterval = 1000/fps;
	then = Date.now();
	animate();
}

/*
 * The animate function is called repeatedly using requestAnimationFrame (see Games on the Web I - HTML5 Graphics and Animations).
 */
function animate() {
	requestAnimationFrame(animate);

	var now = Date.now();
	var elapsed = now - then;

	if (elapsed > fpsInterval) {
		// Acquire both a canvas (using jQuery) and its associated context
		var canvas = $("canvas").get(0);
		var context = canvas.getContext("2d");

		// Calculate the width and height of each cell in our maze
		var cellWidth = canvas.width/cellsWide;
		var cellHeight = canvas.height/cellsHigh;

		// Clear the drawing area each animation cycle
		context.clearRect(0, 0, canvas.width, canvas.height);

		// Change the current colour to yellow, to draw the 'goal' state
		context.fillStyle = "yellow";
		// The goal is calculated by multiplying the cell location (mazeEnd.x, mazeEnd.y)
		// by the cellWidth and cellHeight respectively
		// Refer to: Games on the Web I - HTML5 Graphics and Animations, Lab Exercise 2
		context.fillRect(mazeEnd.x * cellWidth,
						 mazeEnd.y * cellHeight,
						 cellWidth, cellHeight);

		// Change the current colour to black, and the line width to 2
		context.fillStyle = "black";
		context.lineWidth = 2;

		// Loop through the 2D array, in both rows and columns...
		for (i = 0; i < maze.length; i++) {

			for (j = 0; j < maze[i].length; j++) {

				// ... and for every cell in the maze, check where it has walls
				// For every wall we find, draw that wall in an appropriate place

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
}
