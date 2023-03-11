
const app = require("../app");
const mongoose = require("mongoose");
const request = require("supertest");

require("dotenv").config();

beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URL);
  });

  afterEach(async () => {
    await mongoose.connection.close();
  });
  
  // Test getting all notes 
  describe("GET /api/notes", () => {
    it("should return all notes", async () => {
      const res = await request(app).get("/api/notes");
      expect(res.statusCode).toBe(200);
      expect(res.body.notes.length).toBeGreaterThan(0);
      expect(res.body.notes.length).toEqual(1)
    });
  });

  // Test getting note by id 
  describe("GET /api/notes/:id", () => {
    it("should return a note by given id ", async () => {
      const res = await request(app).get(
        "/api/notes/6408e641c9c20a78e18e3519"
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.note.description).toBe("testtest");
    });
  });
