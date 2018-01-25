// See Real-Time Servers II: File Servers for understanding
// how we set up and use express
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

// We will use the generate-maze module to generate random mazes
// Details at: https://www.npmjs.com/package/generate-maze
var mazeGenerator = require("generate-maze");

// We are going to serve our static pages from the public directory
// See Real-Time Servers II: File Servers for understanding
// how we set up and use express
app.use(express.static("public"));

var maze;
var mazeStart;
var mazeEnd;
var rows = 10;  // size of maze horizontally
var cols = 10; // size of maze vertically
var startLocation;



/*
 * The getMazeData function packages up important information about a maze
 * into an object and prepares it for sending in a message.
 *
 * The members of the returned object are as follows:
 * - mazeSize
 * -- rows, the number of rows in the maze
 * -- cols, the number of columns in the maze
 *
 * - mazeCells, a two-dimensional array of objects each containing members:
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
 */
function getMazeData() {
	var mazeData = {
		mazeSize: {
			rows: rows,
			cols: cols
		},
		mazeCells: maze,
		mazeStart: mazeStart,
		mazeEnd: mazeEnd
	};
	return mazeData;
}

// Player information
function getPlayerData(){
	var playerData = {
		startLocation: startLocation
	};
	return playerData;
}

/*
 * This is our event handler for a connection.
 * That is to say, any code written here executes when a client makes a connection to the server
 * (i.e. when the page is loaded)
 *
 * See Real-Time Servers III: socket.io and Messaging for help understanding how
 * we set up and use socket.io
 */
io.on("connection", function(socket) {

	// Print an acknowledge to the server's console to confirm a player has connected
	console.log("A player has connected - sending maze data...");
	// Print an acknowledge to the server's console to confirm a player has spawned
	spawnPlayer();
	console.log("Player spawned!");
	/*
	 * Here we send all information about a maze to the client that has just connected
	 * For full details about the data being sent, check the getMazeData method
	 * This message triggers the socket.on("maze data"... event handler in the client
	 */
	socket.emit("maze data", getMazeData());
	socket.emit("player data", getPlayerData());

});

/*
 * The generateMaze function uses the generate-maze module to create a random maze,
 * which is stored in the 'maze' variable as a 2D array.
 * Additionally, a start point is created (this is always at the top-left corner)
 * and an end point is created (this is always the bottom-right corner).
 */
function generateMaze() {
	maze = mazeGenerator(rows, cols);
	mazeStart = {
		x: 0,
		y: 0
	};
	mazeEnd = {
		x: cols-1,
		y: rows-1
	};
}

function spawnPlayer(){
	startLocation = {
		x: 0,
		y: 0
	};
}

/*
 * Start the server, listening on port 8081.
 * Once the server has started, output confirmation to the server's console.
 * After initial startup, generate a maze, ready for the first time a client connects.
 *
 */
server.listen(8081, function() {
	console.log("Map server has started - connect to http://192.168.0.7:8081")
	generateMaze();
	console.log("Initial Maze generated!");
});
