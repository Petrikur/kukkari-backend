
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const User = require('../models/User');

// Get notes
const getAllNotes = async (req, res, next) => {
    let notes;
    try {
      notes = await Note.find({});
    } catch (err) {
      const error = new Error(
        'Fetching notes failed, please try again later.',
        500
      );
      return next(error);
    }
    res.json({notes: notes.map(note => note.toObject({ getters: true }))});
  };
  const createNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new Error('Invalid inputs passed, please check your data.', 422)
      );
    }
  
    const { title, description, name } = req.body;
  
    const createdNote = new Note({
      title,
      description,
      creator: req.userId,
      name
    });
  
    let user;
    try {
      user = await User.findById(req.userId);
    } catch (err) {
      const error = new Error('Creating note failed, please try again1', 500);
      return next(error);
    }
  
    if (!user) {
      const error = new Error('Could not find user for provided id', 404);
      return next(error);
    }
  
    console.log(user);
  
    let session;
    try {
      session = await mongoose.startSession();
      await session.withTransaction(async () => {
        await createdNote.save({ session });
        user.notes.push(createdNote);
        await user.save({ session });
      });
    } catch (err) {
      const error = new Error(
        'Creating note failed, please try again2.',
        500
      );
      await session.abortTransaction();
      session.endSession();
      return next(error);
    }
  
    session.endSession();
  
    res.status(201).json({ note: createdNote });
  };
exports.createNote = createNote;
exports.getAllNotes =getAllNotes;
