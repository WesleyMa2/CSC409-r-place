const redis = require("redis");
const client = redis.createClient({
    host: 'place-redis.9nutlu.0001.use1.cache.amazonaws.com',    
});
 
client.on("error", function(error) {
  console.error(error);
});

client.set("hi", "ho", redis.print);