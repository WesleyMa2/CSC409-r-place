// Web server
const WebSocket = require('ws');
var express = require('express');
var app = express();

const SOCKET_PORT = 8081
const HTTP_PORT = 80
const wss = new WebSocket.Server({ port: SOCKET_PORT });

// Redis
const redis = require('redis')
const DIM = 1000
const client = redis.createClient({
	host: 'place-redis.9nutlu.0001.use1.cache.amazonaws.com',
	port: '6379'
});

var DIM = 1000;
var board = new Array(DIM);
for (var x = 0; x < DIM; x++) {
	board[x] = new Array(DIM);
	for (var y = 0; y < DIM; y++) {
		board[x][y] = { 'r': 255, 'g': 255, 'b': 255 };
	}
}

wss.on('close', function () {
	console.log('disconnected');
});

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

// for heartbeat to make sure connection is alive 
function noop() { }
function heartbeat() {
	this.isAlive = true;
}

function isValidSet(o) {
	var isValid = false;
	try {
		isValid =
			Number.isInteger(o.x) && o.x != null && 0 <= o.x && o.x < DIM &&
			Number.isInteger(o.y) && o.y != null && 0 <= o.y && o.y < DIM &&
			Number.isInteger(o.r) && o.r != null && 0 <= o.r && o.r <= 255 &&
			Number.isInteger(o.g) && o.g != null && 0 <= o.g && o.g <= 255 &&
			Number.isInteger(o.b) && o.b != null && 0 <= o.b && o.b <= 255;
	} catch (err) {
		isValid = false;
	}
	return isValid;
}
wss.on('connection', function (ws) {
	// heartbeat
	ws.isAlive = true;
	ws.on('pong', heartbeat);

	// send initial board: this is slow!!!
	for (x = 0; x < DIM; x++) {
		for (y = 0; y < DIM; y++) {
			var o = { 'x': x, 'y': y, 'r': board[x][y].r, 'g': board[x][y].g, 'b': board[x][y].b };
			ws.send(JSON.stringify(o));
		}
	}

	// when we get a message from the client
	ws.on('message', function (message) {
		console.log(message);
		var o = JSON.parse(message);
		if (isValidSet(o)) {
			wss.broadcast(message);
			board[o.x][o.y] = { 'r': o.r, 'g': o.g, 'b': o.b };
		}
	});
});

// heartbeat (ping) sent to all clients
const interval = setInterval(function ping() {
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();

		ws.isAlive = false;
		ws.ping(noop);
	});
}, 30000);

// static client files
if (app.get('env') === 'production') {
	app.get("/", (req, res) => {
		res.status(301).redirect("http://csc409-place-client.s3-website.ca-central-1.amazonaws.com")
	})
} else {
	app.use('/', express.static('static_files'));
}
const chunkSize = DIM * DIM / 10
const pixelBatchsPerChunk = chunkSize / (64 / 4)
// retrieve bitfield from redis
app.get("/bitfield", (req, res) => {
	const bitfield = new Array()
	const batch = client.batch();
	for (let chunk = 0; chunk < 10; chunk++) {
		for (let i = 0; i < pixelBatchsPerChunk; i++) batch.bitfield('place', 'GET', 'i64', '#' + (chunk * chunkSize + i))
		count += pixelBatchsPerChunk
		batch.exec((reply, err) => {
			console.log('Set ' + count + 'pixels to 0')
			if (err) console.log(err)
			else bitfield.push(res)
		})
	}
	res.send(bitfield)
})

app.listen(HTTP_PORT, function () {
	console.log('mode: ' + app.get('env'))
	console.log('Server listening on port ' + HTTP_PORT);
});

