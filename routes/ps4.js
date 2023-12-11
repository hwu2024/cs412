var express = require('express');
const {response} = require("express");
const request = require('request')
const redis = require('redis');
const fetch = require('node-fetch');
var router = express.Router();

const redisClient = redis.createClient({
    host: 'localhost', // change this to your Redis server host
    port: 6379, // change this to your Redis server port
});

redisClient.connect();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('main');
});

router.post('/async-api-call', async (req, res) => {
    const city = req.body.city;
    const apiKey = '0d15c86e752a478d8de212106231012'; // Make sure to keep your API keys secure
    const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

    // Key for caching/responses
    const cacheKey = `weather:${city}`;

    try {
        // Check the cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData !== null) {
            // Cache hit - data was found in Redis
            res.json({ weather: JSON.parse(cachedData), fromCache: true });
        } else {
            // Cache miss - data not in Redis
            const response = await fetch(apiUrl, {
                method: 'GET', // Weather API might be a GET request instead
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Cache the external API response with a 15-second expiration
            await redisClient.setEx(cacheKey, 15, JSON.stringify(data));

            res.json({ weather: data, fromCache: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;