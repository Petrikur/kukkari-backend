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
      name: "testuser",
    });
    expect(res.body.token.length).toBeGreaterThan(5);
  });
});

// Test logging in.
describe("POST /api/users/login", () => {
  it("Should return a valid authentication token", async () => {
    // Then, send a login request with the user's email and password
    const res = await request(app).post("/api/users/login").send({
      email: "test3@test.com",
      password: "test12345",
    });

    // Verify that the response contains a valid authentication token
    expect(res.statusCode).toBe(200);
    const user = await User.findById(res.body.userId);
    expect(res.body).toMatchObject({
      userId: user._id.toString(),
      email: "test3@test.com",
      token: expect.any(String),
    });
    expect(res.body.token.length).toBeGreaterThan(5);
  });
});

// Test get all users
describe("GET /api/users", () => {
  it("should return an array of users", async () => {
    // Create some test users in the database
    const newUser1 = new User({
      name: "testuser1",
      email: "testuser1@testi.com",
      password: "test12345",
    });
    await newUser1.save();

    const newUser2 = new User({
      name: "testuser2",
      email: "testuser2@testi.com",
      password: "test12345",
    });
    await newUser2.save();

    //  GET request to retrieve all users
    const res = await request(app).get("/api/users");

    // Verify that the response contains an array of users
    expect(res.statusCode).toBe(200);
    console.log(res.body.users);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
    expect(res.body.users[0]).toMatchObject({
      name: "testuser1",
      email: "testuser1@testi.com",
    });
    expect(res.body.users[1]).toMatchObject({
      name: "testuser2",
      email: "testuser2@testi.com",
    });
  });
});
