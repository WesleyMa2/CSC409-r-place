const redis = require('redis')
const DIM = 1000
const client = redis.createClient({
    host: 'place-redis.9nutlu.0001.use1.cache.amazonaws.com',
    port: '6379'
});

client.on("error", function(error, reply) {
  if (error) console.error(error)
  else console.log(reply)
})
const batch = client.batch();
const chunkSize = 4 *DIM*DIM/10
const batchRequestNum = chunkSize/ 32
let count = 0;
// Resets bitfield
for (let chunk = 0; chunk < 10; chunk++){
  for (let i = 0; i < batchRequestNum; i++) batch.bitfield('place', 'SET', 'u32', '#'+(chunk*batchRequestNum + i), 4294967295)
  count += batchRequestNum 
  batch.exec((reply, err) => {
    console.log('Set '+count+'pixels to 0')
    if (err) console.log(err)
    else console.log(reply)
  })
}

//const testBatch = client.batch()
//for (let i = 0; i < 10; i++) testBatch.bitfield('place', 'GET', 'u16', i)
//testBatch.exec((reply, err) => {
//  console.log('retrieving first 100')
//  if (err) console.log(err)
//  else console.log(reply)
//  process.exit(1)
//})
//client.bitfield('place', 'SET', 'u4', '#'+996, 2, redis.print)
//client.bitfield('place', 'SET', 'u4', '#'+997, 4, redis.print)
//client.bitfield('place', 'SET', 'u4', '#'+998, 6, redis.print)
//client.bitfield('place', 'SET', 'u4', '#'+999, 8, redis.print)

//client.bitfield('place', 'GET', 'u16', '#'+249, redis.print)
//client.bitfield('place', 'GET', 'u4', '#'+996, redis.print)
//client.bitfield('place', 'GET', 'u4', '#'+997, redis.print)
//client.bitfield('place', 'GET', 'u4', '#'+998, redis.print)
//client.bitfield('place', 'GET', 'u4', '#'+999, redis.print)
