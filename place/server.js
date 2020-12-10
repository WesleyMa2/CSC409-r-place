// Web server
const WebSocket = require('ws');
var express = require('express');
var app = express();

const SOCKET_PORT = 8081
const HTTP_PORT = 8080
const wss = new WebSocket.Server({ port: SOCKET_PORT });

// Redis
const redis = require('redis')
const DIM = 1000
const client = redis.createClient({
	host: 'place-redis.9nutlu.0001.use1.cache.amazonaws.com',
	port: '6379'
});

// var board = new Array(DIM);
// for (var x = 0; x < DIM; x++) {
// 	board[x] = new Array(DIM);
// 	for (var y = 0; y < DIM; y++) {
// 		board[x][y] = { 'r': 255, 'g': 255, 'b': 255 };
// 	}
//  }

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
	//	for (x = 0; x < DIM; x++) {
	//		for (y = 0; y < DIM; y++) {
	//			var o = { 'x': x, 'y': y, 'r': board[x][y].r, 'g': board[x][y].g, 'b': board[x][y].b };
	//			ws.send(JSON.stringify(o));
	//		}
	//	}


	getBitfield((err, data) => {
		if (err){  
			console.log(err)
			ws.send('server error!') 
		} else {
			const buffer = new Int32Array(data.flat()).buffer
			console.log(buffer.length)
			ws.send(buffer)
		}
	})

	// when we get a message from the client
	ws.on('message', function (message) {
		console.log(message);
		var o = JSON.parse(message);
		if (isValidSet(o)) {
			wss.broadcast(message);
			board[o.x][o.y] = { 'r': o.r, 'g': o.g, 'b': o.b };
			setPixel(o, (err, res) => {
				if (err) ws.send(err)
			})
		} else ws.send('invalid change')
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

const chunkSize = 4 * DIM * DIM / 10 // 400,000 bits
const batchRequestNum = chunkSize / 32 // 6,250 requests
console.log("chunkSize", chunkSize)
console.log("batchRequestNum", batchRequestNum)
function setPixel(pixel, callback){
	const offset = pixel.y * DIM + pixel.x
	client.bitfield('place', 'SET', 'u4', '#'+offset, pixel.r % 16, callback)
}

function getBitfield(callback){
	const bitfield = []
        const batchPromises = []
        // to save memory, use 10 separate batch gets
        for (let chunk = 0; chunk < 10; chunk++) {
                // construct each batch to contain <pixelBatchsPerChunk> amount of 64b ints
		const batch = client.batch()
                const batchProm = new Promise((res, rej) => {
                        for (let i = 0; i < batchRequestNum; i++) batch.bitfield('place', 'GET', 'u32', '#' + ((chunk * batchRequestNum) + i))
                        batch.exec((err, reply) => {
                        	if (err) rej(err)
                                else {res(reply)}
                        })
                })
                batchPromises.push(batchProm)
        }
        // upon resolving all batch writes, flatten results and store into an array
        Promise.all(batchPromises).then(result => {
		result.forEach(el => {
                        bitfield.push(el.flat())
                })
                callback(null, bitfield.flat())
        }).catch(err => callback(err, null))
}

// retrieve bitfield from redis (return array of 64bit signed ints, each int storeing 16 pixels)
app.get("/bitfield", (req, res) => {
	/**
	const bitfield = []
	const batchPromises = []
	// to save memory, use 10 separate batch gets
	for (let chunk = 0; chunk < 10; chunk++) {
		// construct each batch to contain <pixelBatchsPerChunk> amount of 64b ints
		const batch = client.batch()
		const batchProm = new Promise((res, rej) => {
			for (let i = 0; i < batchRequestNum; i++) batch.bitfield('place', 'GET', 'i64', '#' + ((chunk * batchRequestNum) + i))
			batch.exec((err, reply) => {
				if (err) rej(err)
				else res(reply)
			})
		})
		batchPromises.push(batchProm)
	}
	// upon resolving all batch writes, flatten results and store into an array
	Promise.all(batchPromises).then(result => {
		result.forEach(el => {
			bitfield.push(el.flat())
		})
		callback(null, bitfield.flat())
	}).catch(err => callback(err, null))
}

// retrieve bitfield from redis (return array of 64bit signed ints, each int storeing 16 pixels)
app.get("/bitfield", (req, res) => {
	getBitfield((err, data) => {
		if (err) throw new Error(err)
		else res.send(data)
	})
})

app.listen(HTTP_PORT, function () {
	console.log('mode: ' + app.get('env'))
	console.log('Server listening on port ' + HTTP_PORT);
});

