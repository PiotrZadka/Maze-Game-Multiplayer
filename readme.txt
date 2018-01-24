This readme assumes that you have already installed Node.js on your computer.  Node.js is available for
Windows, Mac and Linux, and can be downloaded at the following website: https://nodejs.org/en/
It is recommended that you install the LTS (currently v8.9.4).

Node is already pre-installed on the university machines in the John Dalton building.

For help setting up, running and using Node, check Real-time Servers I: Working with Node.js.

**************************************************************************************************
T****
his skeleton code and associated files are provided to help you begin on the assessment.  The code is quite barebones, and you are welcome to change anything you wish - you may, for example, wish to change some of the existing variables into objects.

A description of each file, and a description of how to get the code running, follows:

* public - the folder that is served by express when a client requests a page
** index.html - the main HTML of the page that will contain your maze game
** MapClient.js - the main JavaScript file containing the code of your Client
* package.json - a Node.JS file which outlines parameters of the project
* readme.txt - this readme
* server.js - the main JavaScript file containing the code of your Server

Your first task is to ensure that you have installed the required Node.js modules.
The skeleton code uses the following modules:
- Socket.IO (https://www.npmjs.com/package/socket.io, version 1.7.4)
- express (https://www.npmjs.com/package/express)
- generate-maze (https://www.npmjs.com/package/generate-maze)

Assuming you have Node.js installed, you can install all the required modules, 
by opening a command line (or a Terminal on a Mac) and running the following command:
	npm install

The Node Package Manager will then read from package.json and install the required dependencies.

You can then run your server with the following command:
	node server.js
  
Open a browser and visit your client (turning your browser tab into a client) at:
	http://localhost:8081

If you have done everything correctly, you should see a maze.

You only need to install your modules once, and subsequent executions of your server can be achieved by:
	node server.js
  
If you make changes to server.js, you will need to stop your server (ctrl+C) and start it again.