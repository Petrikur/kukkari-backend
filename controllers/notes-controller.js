// notes-controller.js
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Note = require("../models/Note");
const User = require("../models/User");
const Comment = require("../models/Comment");
const HttpError = require("../models/http-error");
const {sendEmail} = require("../services/emailService")

let io;
const setIo = (socketIo) => {
  io = socketIo;
};

// Get comments
const getComments = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findById(id).populate("comments");
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    const comments = note.comments;
    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

// Get notes
const getAllNotes = async (req, res, next) => {
  let notes;
  try {
    notes = await Note.find({}).populate("comments");
  } catch (err) {
    const error = new HttpError(
      "Fetching notes failed, please try again later.",
      500
    );
    return next(error);
  }
  res
    .status(200)
    .json({ notes: notes.map((note) => note.toObject({ getters: true })) });
};

// Get note by Id
const getNoteById = async (req, res, next) => {
  const noteId = req.params.pid;

  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a note.",
      500
    );
    return next(error);
  }

  if (!note) {
    const error = new HttpError(
      "Could not find a note for the provided id.",
      404
    );
    return next(error);
  }

  res.status(200).json({ note: note.toObject({ getters: true }) });
};

// Create new note
const createNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  const { title, description, name, userId } = req.body;

  const session = await mongoose.startSession();
  let createdNote;
  try {
    session.startTransaction();

    createdNote = new Note({
      title,
      description,
      creator: userId,
      name,
      comments: [],
    });

    const users = await User.find({ noteNotifications: true }).exec();
    for (const user of users) {
      if (user.name === name) {
        continue;
      }
      const subject = "Uusi kukkarin muistiinpano.";
      const html = `<p>Hei ${user.name}, ${createdNote.name} on tehnyt uuden muistiinpanon kukkarisivulle. Käy lukemassa!</p> <p>Terveisin</p><p>Kukkarin insinööritiimi</p>`;
      await sendEmail(user, subject, html);
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      return next(new HttpError("Could not find user for provided id", 404));
    }
    user.notes.push(createdNote);
    await user.save({ session });
    await createdNote.save({ session });
    await session.commitTransaction();
    io.emit("newNoteAdd", { note: createdNote });
    res.status(201).json({ note: createdNote });
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    next(new HttpError("Creating note failed, please try again.", 500));
  }
};

// DELETE Note
const deleteNote = async (req, res, next) => {
  const noteId = req.params.pid;

  let note;
  try {
    note = await Note.findById(noteId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete note.",
      500
    );
    return next(error);
  }

  if (!note) {
    const error = new HttpError("Could not find note for this id.", 404);
    return next(error);
  }

  if (note.creator.id !== req.userData.userId) {
    const error = new HttpError("You are not allowed to delete this note", 401);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Comment.deleteMany({ noteId: noteId }, { session: sess });
    await Note.deleteOne({ _id: noteId }, { session: sess });
    note.creator.notes.pull(note);
    await note.creator.save({ session: sess });
    await sess.commitTransaction();
    io.emit("deleteNote", { id: noteId });
    res.status(200).json({ message: "Deleted note." });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete note.",
      500
    );
    return next(error);
  }
};

// Patch
const updateNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );

    return next(error);
  }

  const { title, description } = req.body;
  const noteId = req.params.pid;
  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update note.",
      500
    );
    return next(error);
  }

  if (note.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this note", 401);
    return next(error);
  }

  note.title = title;
  note.description = description;

  try {
    await note.save();
    io.emit("updateNote", {
      noteId: note._id,
      note: note.toObject({ getters: true }),
    });
    res.status(200).json({ note: note.toObject({ getters: true }) });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update note.",
      500
    );
    return next(error);
  }
};

exports.createNote = createNote;
exports.getNoteById = getNoteById;
exports.getAllNotes = getAllNotes;
exports.deleteNote = deleteNote;
exports.updateNote = updateNote;
exports.getComments = getComments;
exports.setIo = setIo;
