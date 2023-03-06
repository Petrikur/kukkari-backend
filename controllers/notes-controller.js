
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
      const error = new HttpError(
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
        new HttpError('Invalid inputs passed, please check your data.', 422)
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
      user = await User.findById(req.userData.userId);
    } catch (err) {
      const error = new HttpError('Creating note failed, please try again', 500);
      return next(error);
    }
  
    if (!user) {
      const error = new HttpError('Could not find user for provided id', 404);
      return next(error);
    }
  
    console.log(user);
  
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await createdNote.save({ session: sess });
      user.notes.push(createdNote);
      await user.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        'Creating note failed, please try again.',
        500
      );
      return next(error);
    }
  
    res.status(201).json({ note: createdNote });
  };

exports.createNote = createNote;
exports.getAllNotes =getAllNotes;
