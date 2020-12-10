exports.handler = async (event, context) => {
    // Pushes an update to redis (first checks that the user isn't rate limited)
    const redis = require('redis')
    const { promisify } = require("util");
    const DIM = 1000
    const client = redis.createClient({
        host: 'place-redis.9nutlu.0001.use1.cache.amazonaws.com',
        port: '6379'
    });
    const bitfieldAsync = promisify(client.bitfield).bind(client);
    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client);
    const expireAsync = promisify(client.expire).bind(client);
    ({ x, y, color } = event['body-json'])
    if (!(Number.isInteger(x) && x >= 0 && x < DIM) ||
        !(Number.isInteger(y) && y >= 0 && y < DIM) ||
        !(Number.isInteger(color) && color >= 0 && color < 16)
    ) return {
        statusCode: 400,
        body: "Bad Request",
    }
    try {
        // check that user isn't rate limited currently
        const ip = event.context['source-ip']
        const isLimited = await getAsync(ip)
        if (isLimited) {
            return {
                statusCode: 429,
                body: `Rate limited (${ip})`,
            }
        } else {
            await setAsync(ip, 0)
            await expireAsync(ip, 10)
        }

        // update the bitfield
        const offset = y * DIM + x
        await bitfieldAsync('place', 'SET', 'u4', '#' + offset, color)
        return {
            statusCode: 200,
            body: "Success",
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: "Internal Server Error",
        }
    }
};
