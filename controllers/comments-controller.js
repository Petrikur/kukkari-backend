const Note = require("../models/Note");
// const User = require("../models/User");
const Comment = require("../models/Comment")
const mongoose = require("mongoose")
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error")

let io;
const setIo = (socketIo) => {
  io = socketIo;
};
// function to create a new comment
const createComment = async (req, res, next) => {
    try {
      const { content, author, noteId,authorName } = req.body;
      const comment = new Comment({ content, author,authorName,noteId });
      const note = await Note.findById(noteId);
      note.comments.push(comment);
      await Promise.all([comment.save(), note.save()]);
      io.sockets.emit("updateNoteTest", {noteId, comment})
      io.sockets.emit('newComment',comment);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  };

  const deleteComment = async (req, res, next) => {
    const commentId = req.params.pid;

    let comment;
    try {
      comment = await Comment.findById(commentId);
    } catch (err) {
      const error = new HttpError(
        "Something went wrong, could not delete comment.",
        500
      );
      return next(error);
    }

    if (!comment) {
      const error = new HttpError("Could not find comment for this id.", 404);
      return next(error);
    }

    if (comment.author.toString() !== req.userData.userId) {
      const error = new HttpError(
        "You are not allowed to delete this comment",
        401
      );
      return next(error);
    }

    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await Comment.deleteOne({ _id: commentId }, { session: sess });
      await Note.updateOne(
        { _id: comment.noteId },
        { $pull: { comments: commentId } },
        { session: sess }
      );
      await sess.commitTransaction();

      io.emit("deleteComment", { id: commentId});

      // Update the note in the frontend by emitting an 'updateNote' event
      const updatedNote = await Note.findById(comment.noteId).populate(
        "creator",
        "-password"
      );
      io.emit("updateNote", updatedNote);
      res.status(200).json({ message: "Deleted comment." });
    } catch (err) {
      const error = new HttpError(
        "Something went wrong, could not delete comment.",
        500
      );
      return next(error);
    }
  };


  exports.deleteComment = deleteComment
  exports.createComment = createComment
  exports.setIo = setIo
