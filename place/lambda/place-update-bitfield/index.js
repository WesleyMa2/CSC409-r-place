exports.handler = async (event) => {
    // Pushes an update to redis (first checks that the user isn't rate limited)
    const redis = require('redis')
    const { promisify } = require("util");
    const DIM = 1000
    const client = redis.createClient({
        host: 'place-redis.9nutlu.0001.use1.cache.amazonaws.com',
        port: '6379'
    });
    const bitfieldAsync = promisify(client.bitfield).bind(client);

    ({ x, y, color } = event)
    if (!(Number.isInteger(x) && x >= 0 && x < DIM) ||
        !(Number.isInteger(y) && y >= 0 && y < DIM) ||
        !(Number.isInteger(color) && color >= 0 && color < 16)
    ) return {
        statusCode: 400,
        body: 'Bad request',
    };

    const offset = y * DIM + x
    try {
        await bitfieldAsync('place', 'SET', 'u4', '#' + offset, color)
        return {
            statusCode: 200,
            body: "Success",
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err),
        };
    }
};
