var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

// Generate-maze module to generate random mazes
// Details at: https://www.npmjs.com/package/generate-maze
var mazeGenerator = require("generate-maze");

// Setup public sharing file
app.use(express.static("public"));
var maze;
var mazeStart;
var mazeEnd;
var rows = 10;
var cols = 10;
var players = {};
var playerName;
var defaultColor = "#ff0000";
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

//Player connects to the server
io.on("connection", function(socket) {
	var nameID = socket.id;
	//Set new player name and color
	socket.on("newName",function(name){
		player = players[socket.id] || {};
		var oldName = player.name;
		player.name = name.name;
		player.color = name.playerColor;
		console.log("Player "+oldName+" is now "+player.name);
		io.sockets.emit("New Player",players);
		var names={
			nameOld:oldName,
			nameNew:player.name
		}
		io.sockets.emit("New Log Name",names);
	});

	//Add new player to array
	socket.on("New Player",function(){
		players[socket.id] = {
				x: 0,
				y: 0,
				name: nameID,
				color: defaultColor
			};
			//Greet new player
			console.log("New player with ID: "+socket.id+"has connected.");
			//Send new player parameters to the client
			socket.emit("New Player",players);
			//Send connected players ID to append in log
			io.sockets.emit("New Log Connected",players[socket.id].name);
	});

	//Player press a button
	socket.on("key",function(key){
		player = players[socket.id] || {};
		var top = maze[player.y][player.x].top;
		var bottom = maze[player.y][player.x].bottom;
		var left = maze[player.y][player.x].left;
		var right = maze[player.y][player.x].right;

		// up
		if(!top && key == 'w' || !top && key == 'upButton'){
			player.y -= 1;
		}
		// down
		if(!bottom && key == 's' || !bottom && key == 'downButton'){
			player.y += 1;
		}
		// left
		if(!left && key == 'a' || !left && key == 'leftButton'){
			player.x -= 1;
		}
		// right
		if(!right && key == 'd' || !right && key == 'rightButton'){
			player.x += 1;
		}

		// If player reaches finish line (cell 9,9) reset it's position to start (cell 0,0)
		if(player.x == 9 & player.y == 9){
			for(var id in players){
				players[id].x = 0;
				players[id].y = 0;
			}
			//generate new maze for players
			generateMaze();
			//update the maze layout to everyone
			io.sockets.emit("maze data", getMazeData());
		}

		//Update client with recent location of all players
		io.sockets.emit("New Player",players)
	});

	//Send new maze parameters to client to generate new maze.
	socket.emit("maze data", getMazeData());
	//Player disconnects.
	socket.on("disconnect", function () {
		//Remove player information from the array
		console.log("Player with ID: "+socket.id+"has quit the game.");
		//Let client know to remove specific player
		io.sockets.emit("Disconnected",socket.id);
		//Send disconnected players ID to append in log
		io.sockets.emit("New Log Disconnected",players[socket.id].name);
		//remove player from server
		delete players[socket.id];
	});
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

/*
 * Start the server, listening on port 8081.
 * Once the server has started, output confirmation to the server's console.
 * After initial startup, generate a maze, ready for the first time a client connects.
 */
server.listen(8081, function() {
	console.log("Map server has started - connect to http://localhost:8081")
	generateMaze();
	console.log("Initial Maze generated!");
});
