const app = require("../app");
const request = require("supertest");
require("dotenv").config();
const User = require("../models/user");


// Test signup
describe("POST /api/users/signup", () => {
  afterEach(async () => {
    await User.deleteMany();
  });
 

  it("should return a user", async () => {
    const res = await request(app).post("/api/users/signup").send({
      name: "testuser",
      email: "test7@test.com",
      password: "test12345",
    });

    expect(res.statusCode).toBe(201);
    const user = await User.findById(res.body.userId);
    expect(res.body).toMatchObject({
      userId: user._id.toString(),
      email: "test7@test.com",
      token: expect.any(String),
      name: "testuser",
    });
    expect(res.body.token.length).toBeGreaterThan(5);
  });

  it("should return an error if email already exists", async () => {
    const user = new User({
      name: "existinguser",
      email: "test2@test.com",
      password: "test12345",
    });
    await user.save();

    const res = await request(app).post("/api/users/signup").send({
      name: "testuser",
      email: "test2@test.com",
      password: "test12345",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User exists already, please login instead.");
  });

  it("should return an error if email is invalid", async () => {
    const res = await request(app).post("/api/users/signup").send({
      name: "testuser",
      email: "invalidemail",
      password: "test12345",
    });
    expect(res.statusCode).toBe(400);
  });

  // Test error handling
  describe("Handle error", () => {
    it("should return 400 if user provides invalid input", async () => {
      const res = await request(app).post("/api/users/signup").send({
        name: "test",
        email: "invalid-email",
        password: "password",
      });
      expect(res.statusCode).toBe(400);
    });

    it("should return 500 if an unexpected error occurs", async () => {
      jest.spyOn(User, "findOne").mockImplementationOnce(() => {
        throw new Error("Something went wrong");
      });
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "test3@test.com", password: "test12345" });
      expect(res.statusCode).toBe(500);
    });
  });

  // Test performance
  describe("Performance testing", () => {
    it("should handle a large number of requests", async () => {
      const requests = Array.from({ length: 100 }, () =>
        request(app).get("/api/users")
      );
      await Promise.all(requests);
    });
  });

  // Test getting users
  const testUsers = [
    { name: "testuser1", email: "testuser1@test.com", password: "test12345" },
    { name: "testuser2", email: "testuser2@test.com", password: "test12345" },
  ];
  describe("Using test fixtures", () => {
    beforeEach(async () => {
      await User.insertMany(testUsers);
    });

    afterEach(async () => {
      await User.deleteMany();
    });

    it("should return an array of users", async () => {
      const res = await request(app).get("/api/users");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBe(2);
      expect(res.body.users[0]).toMatchObject({
        name: "testuser1",
        email: "testuser1@test.com",
      });
      expect(res.body.users[1]).toMatchObject({
        name: "testuser2",
        email: "testuser2@test.com",
      });
    });
  });

  // Test coverage
  // describe("Test coverage", () => {
  //   it("should have test coverage of at least 90%", async () => {
  //     const coverage = await request(app).get("/coverage");
  //     expect(parseInt(coverage.text)).toBeGreaterThan(20);
  //   });
  // })
});
