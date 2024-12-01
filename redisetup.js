// redisSetup.js
const redis = require('redis');
// Configure Redis client
const redisClient = redis.createClient({
    url: 'redis://localhost:6379', // Change to your Redis server URL
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis!');
    } catch (err) {
        console.error('Error connecting to Redis:', err);
        process.exit(1); // Exit the process if Redis connection fails
    }
};

// Redis event listeners
redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = { redisClient, connectRedis };
