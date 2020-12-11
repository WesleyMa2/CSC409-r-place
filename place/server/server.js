// Web server
const WebSocket = require('ws');
var express = require('express');
var app = express();

const SOCKET_PORT = 8081
const HTTP_PORT = 8080
const wss = new WebSocket.Server({ port: SOCKET_PORT });
let lastUpdate = 0
let cachedBitfield = null;

// Redis
const redis = require('redis')
const DIM = 1000
const client = redis.createClient({
	host: 'place-redis.9nutlu.0001.use1.cache.amazonaws.com',
	port: '6379'
});

const subscriber = redis.createClient({
	host: 'place-redis.9nutlu.0001.use1.cache.amazonaws.com',
	port: "6379"
})


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

// for heartbeat to make sure client connection is alive 
function noop() { }
function heartbeat() {
	this.isAlive = true;
}

wss.on('connection', function (ws) {
	// heartbeat
	ws.isAlive = true;
	ws.on('pong', heartbeat);
	
	const currTime = new Date().getTime()
	if ((currTime - lastUpdate) < 100){
		ws.send(cachedBitfield)
		return
	}

	getBitfield((err, data) => {
		if (err) {
			console.log(err)
			ws.send('server error!')
		} else {
			lastUpdate = new Date().getTime()
			cachedBitfield = new Int32Array(data.flat()).buffer
			ws.send(cachedBitfield)
		}
	})
});

// heartbeat (ping) sent to all clients
setInterval(function ping() {
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();

		ws.isAlive = false;
		ws.ping(noop);
	});
}, 30000);

const chunkSize = 4 * DIM * DIM / 10 // 400,000 bits
const batchRequestNum = chunkSize / 32 // 6,250 requests

// subscribe to redis for pixel updates
subscriber.on("message", (channel, message) => {
	wss.broadcast(message)
})
subscriber.subscribe("pixel-updates")

function getBitfield(callback) {
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
				else { res(reply) }
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
// ping function for aws loadpalance healthchecks
app.get("/ping", (req, res) => {
	res.sendStatus(200)
})


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

