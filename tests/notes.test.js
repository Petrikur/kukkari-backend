const app = require("../app");

const request = require("supertest");

const Note = require("../models/note");
const User = require("../models/user");
require("dotenv").config();

// beforeEach(async () => {
//   await mongoose.connect(process.env.MONGO_URL);
// });

// afterEach(async () => {
//   await mongoose.connection.close();
// });

// Test getting all notes
describe("GET /api/notes", () => {
  it("should return all notes", async () => {
    const res = await request(app).get("/api/notes");
    expect(res.statusCode).toBe(200);
    expect(res.body.notes.length).toBeGreaterThan(0);

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

//Test creating new note with missing data
describe("POST /api/notes/newnote", () => {
  it("It should return error code 500", async () => {

    const [authToken,userId] = await getTokenAndUserId();
    const newNote = {
      title: "New Note",
      description: "This is a new note",
      userId: "wrong userId",
      name: "test",
    };

    const res = await request(app)
      .post("/api/notes/newnote")
      .set("Authorization", `Bearer ${authToken}`)
      .send(newNote);
    expect(res.statusCode).toBe(500);
  });
});

// Delete note
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

// Test delete with missing token
describe("DELETE /api/notes/:id", () => {
  it("It should return error code 500 because missing token", async () => {
    const noteId = "641376f5d63c235dc7fe2755";

    const user = {
      email: "test3@test.com",
      password: "test12345",
    };

    const authRes = await request(app).post("/api/users/login").send(user);
    const deleteRes = await request(app).delete(`/api/notes/${noteId}`)
    expect(deleteRes.statusCode).toBe(500);

  });
});
  
// Test create new note 
describe("POST /api/notes/newnote", () => {
  it("should create a new note", async () => {
    const [userId, authToken] = await getTokenAndUserId();
    console.log("userid:" + userId + "token:" + authToken);

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

// Function to get token and user id 
const getTokenAndUserId = async () => {
  const signUpInfo = {
    name: "test name ",
    email: "test3@test.com",
    password: "test12345",
  };
  const signupRes = await request(app)
    .post("/api/users/signup")
    .send(signUpInfo);

  const loginInfo = {
    email: "test3@test.com",
    password: "test12345",
  };

  const loginRes = await request(app).post("/api/users/login").send(loginInfo);
  const authToken = loginRes.body.token;
  const userId = loginRes.body.userId;
  return [userId, authToken];
};
