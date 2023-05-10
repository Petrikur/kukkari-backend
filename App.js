const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');

const usersRoutes = require('./routes/users-routes');
const notesRoutes = require('./routes/notes-routes');
const reservationRoutes = require('./routes/reservation-routes');
const commentsRoutes = require("./routes/comments-routes")
const weatherRoutes = require("./routes/weather-routes")
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  next();
});

const startServer = async () => {
  if (process.env.NODE_ENV === 'test') {
    const mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log('MongoDB Memory Server connected');
  } else {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected');
  }
  app.listen( process.env.port || 5000);
  console.log('Server running');
};



// Get coverage
app.get("/coverage", async (req, res, next) => {
  const coverage = await fs.promises.readFile("./coverage/coverage-summary.json", "utf-8");
  const test = require("./")
  const json = JSON.parse(coverage);
  const totalCoverage = json.total.branchs.pct;
  res.send(totalCoverage);
});

app.use('/api/users', usersRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/weather', weatherRoutes);

// Errors
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

startServer().catch((err) => {
  console.log(err);
});

module.exports = app;