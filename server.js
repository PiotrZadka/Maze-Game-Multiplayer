var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var mazeGenerator = require("generate-maze");
app.use(express.static("public"));

var maze;
var mazeStart;
var mazeEnd;
var rows = 10;
var cols = 10;
var players = {};

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

io.on("connection", function(socket) {

	//add new socket to array
	socket.on("New Player",function(){
		players[socket.id] = {
				x: 0,
				y: 0
			};
			console.log(players);
			socket.emit("New Player",players);
	});

	socket.on("key",function(key){
		player = players[socket.id] || {};
		var top = maze[player.y][player.x].top;
		var bottom = maze[player.y][player.x].bottom;
		var left = maze[player.y][player.x].left;
		var right = maze[player.y][player.x].right;

		// up
		if(!top && key == 'w'){
			player.y -= 1;
		}
		// down
		if(!bottom && key == 's'){
			player.y += 1;
		}
		// left
		if(!left && key == 'a'){
			player.x -= 1;
		}
		// right
		if(!right && key == 'd'){
			player.x += 1;
		}
		io.sockets.emit("New Player",players)
	});

	socket.emit("maze data", getMazeData());
});


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

server.listen(8081, function() {
	console.log("Map server has started - connect to http://localhost:8081")
	generateMaze();
	console.log("Initial Maze generated!");
});
