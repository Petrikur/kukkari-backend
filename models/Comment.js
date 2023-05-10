const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema(
    {
      content: { type: String, required: true },
      author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
      authorName: { type: String, required: true },
      noteId: { type: mongoose.Types.ObjectId, required: true, ref: "Note" },
    },
    { timestamps: true }
  );
  

module.exports = mongoose.model("Comment", commentSchema);
