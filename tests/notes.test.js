const app = require("../app");
const mongoose = require("mongoose");
const request = require("supertest");

const Note = require("../models/note")
const User = require("../models/user")
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

// get note by id
describe("GET /api/notes/:id", () => {
  it("should return a note by given id ", async () => {
    // Create a test user account
    const user = {
      email: "test3@test.com",
      password: "test12345",
    };

    const authRes = await request(app).post("/api/users/login").send(user);
    const authToken = authRes.body.token;
  

    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    const res = await request(app).get("/api/notes/640dd3151ee9af45cd99920f").set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.note.description).toBe("description test");
  });
});

// Patch note test
describe("PATCH /api/notes/:id", () => {
  it("should update a note by given id ", async () => {
    const noteId = "640dd3151ee9af45cd99920f";

    const user = {
      email: "test3@test.com",
      password: "test12345",
    };

    const authRes = await request(app).post("/api/users/login").send(user);
    const authToken = authRes.body.token;

    const updateData = {
      title: "Updated Title",
      description: "Updated description",
    };

    const res = await request(app)
      .patch(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.note.title).toBe("Updated Title");
    expect(res.body.note.description).toBe("Updated description");
  });
});


describe("POST /api/notes/newnote", () => {
  it("should create a new note", async () => {

    const [authToken,userId] = await getToken();
    const newNote = {
      title: "New Note",
      description: "This is a new note",
      userId: userId,
      name: "test",
    };

    const res = await request(app)
      .post("/api/notes/newnote")
      .set("Authorization", `Bearer ${authToken}`)
      .send(newNote);

    expect(res.statusCode).toBe(201);
    expect(res.body.note.title).toBe("New Note");
    expect(res.body.note.description).toBe("This is a new note");
  });
});

const getToken = async () => {
  const user = {
    email: "test3@test.com",
    password: "test12345",
  };

  const authRes = await request(app).post("/api/users/login").send(user);
  const authToken = authRes.body.token;
  const userId = authRes.body.userId
  return [authToken,userId]
}


describe("DELETE /api/notes/:id", () => {
  it("should delete a note by given id and remove it from the creator's notes array", async () => {
    const noteId = "640dea40a19806ae8d77862e";

    const user = {
      email: "test3@test.com",
      password: "test12345",
    };

    const authRes = await request(app).post("/api/users/login").send(user);
    const authToken = authRes.body.token;

    const deleteRes = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${authToken}`);
      await new Promise(resolve => setTimeout(resolve, 3000));

    expect(deleteRes.statusCode).toBe(200);
    const deletedNote = await Note.findById(noteId);
    expect(deletedNote).toBeNull();
    const userWithDeletedNote = await User.findOne({ email: user.email });
    expect(userWithDeletedNote.notes).not.toContain(noteId);
  });
});