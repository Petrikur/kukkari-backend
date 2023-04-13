
// notes-controller.js
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Note = require("../models/Note");
const User = require("../models/User");

// Get comments
const getComments = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findById(id).populate('comments');
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    const comments = note.comments;
    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

// Get notes
const getAllNotes = async (req, res, next) => {
  let notes;
  try {
    notes = await Note.find({}).populate("comments");
  } catch (err) {
    const error = new Error(
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
    const error = new Error(
      "Something went wrong, could not find a note.",
      500
    );
    return next(error);
  }

  if (!note) {
    const error = new Error("Could not find a note for the provided id.", 404);
    return next(error);
  }

  res.status(200).json({ note: note.toObject({ getters: true }) });
};

 // Create new note 
const createNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new Error("Invalid inputs passed, please check your data.", 422)
    );
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
    });

    await createdNote.save({ session });

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("Could not find user for provided id");
    }
    user.notes.push(createdNote);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    next(new Error("Creating note failed, please try again."));
  } finally {
    session.endSession();
  }
  res.status(201).json({ note: createdNote });
};

// DELETE Note
const deleteNote = async (req, res, next) => {
  const noteId = req.params.pid;

  let note;
  try {
    note = await Note.findById(noteId).populate("creator");
  } catch (err) {
    const error = new Error(
      "Something went wrong, could not delete note.",
      500
    );
    return next(error);
  }

  if (!note) {
    const error = new Error("Could not find note for this id.", 404);
    return next(error);
  }

  if (note.creator.id !== req.userData.userId) {
    const error = new Error("You are not allowed to delete this note", 401);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Note.deleteOne({ _id: noteId }, { session: sess });
    note.creator.notes.pull(note);
    await note.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error(
      "Something went wrong, could not delete note.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted note." });
};

// Patch
const updateNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new Error("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const noteId = req.params.pid;
  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    const error = new Error(
      "Something went wrong, could not update note.",
      500
    );
    return next(error);
  }

  if (note.creator.toString() !== req.userData.userId) {
    const error = new Error("You are not allowed to edit this note", 401);
    return next(error);
  }

  note.title = title;
  note.description = description;

  try {
    await note.save();
  } catch (err) {
    const error = new Error(
      "Something went wrong, could not update note.",
      500
    );
    return next(error);
  }

  res.status(200).json({ note: note.toObject({ getters: true }) });
};

exports.createNote = createNote;
exports.getNoteById = getNoteById;
exports.getAllNotes = getAllNotes;
exports.deleteNote = deleteNote;
exports.updateNote = updateNote;
exports.getComments = getComments
