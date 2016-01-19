var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs');

var lineRef = 0,
    logFile = '/var/www/html/brwtest/logfile.txt',
    sys = require('sys'),
    exec = require('child_process').exec,
    child;

//callback function to handle new lines
var callback = function(line) {
	console.log(line);
        io.sockets.emit('recvLog', line);
}

// creating the server ( localhost:8000 )
app.listen(8000);

console.log('server listening on localhost:8000');

var userDetails = {};

// on server started we can load our client.html page
function handler(req, res) {
		res.writeHead(200);
		res.end();
}

// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {
	socket.on('sendinvitation', function(invitation) {
		console.log('---------------------------SEND INVITE');
		console.log(invitation);
		io.sockets.emit('recvInvitation', invitation);
	});

	socket.on('setUser', function(user) {
		userDetails[user.userid] = 1;
		console.log('---------------------------SETUSER');
		console.log(userDetails);
	});

	socket.on('resetUser', function(user) {
		delete userDetails[user.userid];
		console.log('---------------------------RESETUSER');
		console.log(userDetails);
	});

	socket.on('setEmailVerify', function(user) {
		console.log('---------------------------SETEMAILVERIFY');
		console.log(user);
		io.sockets.emit('emailVerified', user);
	});	

	socket.on('onMessage', function(msg) {
		console.log('---------------------------ONMESSAGE');
		console.log(msg);
	});	

        socket.on('startTailLog', function() {
                get_line(callback);
                fs.watchFile(logFile, function (curr, prev) {
                        get_line(callback);
                });
                startWriting();
        });
	
	

});




/*BRWTEST CHANGES*/

//get lines from the log file
function get_line(callback) {
        var data = fs.readFileSync(logFile, 'utf8');
        var lines = data.split("\n");
        var newlines = [];
        var cnt = 0;
        for(var i = lineRef;i<lines.length - 1;i++) {
                lineRef++;
                newlines[cnt] = lines[i];
                cnt++;
        }
        callback(newlines);
}

function startWriting() {
        child = exec(" sh /var/www/html/brwtest/startlog.sh ", function (error, stdout, stderr) {
                sys.print('stdout: ' + stdout);
                sys.print('stderr: ' + stderr);
                if (error !== null) {
                        console.log('exec error: ' + error);
                }
        });

}

