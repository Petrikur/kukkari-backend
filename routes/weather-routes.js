const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const router = express.Router();
require("dotenv").config();

const cache = new NodeCache({ stdTTL: 1800 });

router.get("/", async (req, res) => {
  const city = process.env.city;
  const key = `weather-${city}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    console.log(`Retrieving cached data for ${city}`);
    return res.json(cachedData);
  }
  const lat = process.env.lat;
  const lon = process.env.lon;
  console.log(`Fetching weather data for ${city}`);
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${process.env.OW_APIKEY}&units=metric&lang=fi`;
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
