const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require("./routes/users-routes");
const notesRoutes = require("./routes/notes-routes");

const reservationRoutes = require("./routes/reservation-routes")
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});

app.use("/api/users", usersRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/notes", notesRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(5000);
    console.log("Server running")
  })
  .catch((err) => {
    console.log(err);
  });


  module.exports = app;