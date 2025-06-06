const { createClient } = require('redis');
require('dotenv').config(); // ensure env is loaded if needed

const redisClient = createClient({
  socket: {
    host: '127.0.0.1', // or your Redis host
    port: 6379         // default Redis port
  },
  database: Number(process.env.redisDBInstance || 0), // this is how you set DB
});

redisClient.on('error', (err) => {
  console.error('Error connecting to Redis server:', err);
});

redisClient.connect(); // must call connect() in redis v4+

module.exports = redisClient;
