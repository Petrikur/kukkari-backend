const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const router = express.Router();
require("dotenv").config();

const cache = new NodeCache({ stdTTL: 1800 }); 

router.get("/", async (req, res) => {
  const city = process.env.city
  const key = `weather-${city}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    console.log(`Retrieving cached data for ${city}`);
    return res.json(cachedData);
  }
  console.log(`Fetching weather data for ${city}`);
  const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=fi&units=metric&appid=${process.env.OW_APIKEY}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    cache.set(key, data);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch weather data" });
  }
});

module.exports = router;
