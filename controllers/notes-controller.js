
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
    res.status(200).json({notes: notes.map(note => note.toObject({ getters: true }))});
  };

  
  // Get note by Id
  const getNoteById = async (req, res, next) => {
    const noteId = req.params.pid;
  
    let note;
    try {
      note = await Note.findById(noteId);
      
    } catch (err) {
      const error = new Error(
        'Something went wrong, could not find a note.',
        500
      );
      return next(error);
    }
  
    if (!note) {
      const error = new Error(
        'Could not find a note for the provided id.',
        404
      );
      return next(error);
    }
  
    ////
    res.status(200).json({ note: note.toObject({ getters: true }) });
  };


  // create note
  const createNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new Error('Invalid inputs passed, please check your data.', 422)
      );
    }
  
    const { title, description, name, userId } = req.body;
  
    console.log(req.body)
    const createdNote = new Note({
      title,
      description,
      creator: userId,
      name
    });
  
    let user;
    try {
      user = await User.findById(userId);
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

  
// DELETE Note
const deleteNote = async (req, res, next) => {
    const noteId = req.params.pid;
  
    let note;
    try {
      note = await Note.findById(noteId).populate('creator');
    } catch (err) {
      const error = new Error(
        'Something went wrong, could not delete note.',
        500
      );
      return next(error);
    }
  
    if (!note) {
      const error = new Error('Could not find note for this id.', 404);
      return next(error);
    }

    console.log(note.creator)
  
    if (note.creator.id !== req.userData.userId){
      const error = new Error(
        'You are not allowed to delete this note',
        401
      );
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
        'Something went wrong, could not delete note.',
        500
      );
      return next(error);
    }
  
    res.status(200).json({ message: 'Deleted note.' });
  };

  // Patch
  const updateNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new Error('Invalid inputs passed, please check your data.', 422)
      );
    }
  
    const { title, description } = req.body;
    const noteId = req.params.pid;
    let note;
    try {
        note = await Note.findById(noteId);
    } catch (err) {
        const error = new Error(
            'Something went wrong, could not update note.',
            500
            );
            return next(error);
        }
  
    if (note.creator.toString() !== req.userData.userId){
      const error = new Error(
        'You are not allowed to edit this note',
        401
      );
      return next(error);
    }
  
    note.title = title;
    note.description = description;
  
    try {
      await note.save();
    } catch (err) {
      const error = new Error(
        'Something went wrong, could not update note.',
        500
      );
      return next(error);
    }
  
    res.status(200).json({ note: note.toObject({ getters: true }) });
  };

exports.createNote = createNote;
exports.getNoteById = getNoteById;
exports.getAllNotes =getAllNotes;
exports.deleteNote = deleteNote;
exports.updateNote = updateNote
