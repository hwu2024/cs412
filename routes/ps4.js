var express = require('express');
const {response} = require("express");
const request = require('request')
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('main');
});

router.post('/request', (req, res) => {
    const city = req.body.city;
    const apiKey = '0d15c86e752a478d8de212106231012';
    const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

    new Promise((resolve, reject) => {
        request(apiUrl, { json: true }, (err, response, body) => {
            if (err) {
                return reject(err);
            }
            resolve(body);
        })
    })
        .then(data => {
            res.render('request', { weather: data });
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

router.post('/async-api-call', async (req, res) => {
    const city = req.body.city;
    const apiKey = '0d15c86e752a478d8de212106231012';
    const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

    try {
        // Replace 'API_ENDPOINT' with the actual endpoint you want to hit
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body), // assuming you are sending JSON data
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.render('request', { weather: data });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/callback-api-call', (req, res) => {
    const city = req.body.city;
    const apiKey = '0d15c86e752a478d8de212106231012';
    const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

    request({
        url: apiUrl,
        method: 'POST',
        json: true,
        body: req.body, // assuming you are sending JSON data
    }, (error, response, body) => {
        if (error) {
            return res.status(500).send(error);
        }

        res.render('request', { weather: body });
    });
});

module.exports = router;