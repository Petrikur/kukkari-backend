const app = require("../app");
const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();
const User = require("../models/user");

beforeEach(async () => {
  await mongoose.connect(process.env.MONGO_URL);
});

afterEach(async () => {
  await mongoose.connection.close();
});

// Test signup and verify that database contains new user

describe("POST /api/users/signup", () => {
    it("should return a user", async () => {
      const res = await request(app).post("/api/users/signup").send({
        name: "testuser",
        email: "test3@test.com",
        password: "test12345",
      });
  
      expect(res.statusCode).toBe(201);
      const user = await User.findById(res.body.userId);
      expect(res.body).toMatchObject({
        userId: user._id.toString(),
        email: "test3@test.com",
        token: expect.any(String),
        name: "testuser"
      });
      expect(res.body.token.length).toBeGreaterThan(5);
    });
  });
