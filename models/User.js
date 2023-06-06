const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    emailNotifications: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken:{ type:String,},
    resetPasswordExpires:{type: Date,},
    notes: [{ type: mongoose.Types.ObjectId, required: true, ref: "Note" }],
    reservations: [
      { type: mongoose.Types.ObjectId, required: true, ref: "Reservation" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
