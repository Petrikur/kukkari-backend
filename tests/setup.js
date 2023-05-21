const mongoose = require("mongoose");
require("dotenv").config();
process.env.NODE_ENV = "test";

async function setupTestDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Test database connected");
  } catch (err) {
    console.log(err);
  }
}
module.exports = setupTestDB;
