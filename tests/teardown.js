const mongoose = require("mongoose");
const User = require("../models/User");

async function teardownTestDB() {
  try {
    await mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
}

module.exports = teardownTestDB;
