const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const HttpError = require("../models/http-error");
require("dotenv").config();
const { sendEmail } = require("../services/emailService");

const getEmailNotifications = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { noteNotifications, reservationNotifications } = user;

    res
      .status(200)
      .json({
        noteEmailNotifications: noteNotifications,
        reservationEmailNotifications: reservationNotifications,
      });
  } catch (error) {
    console.error("Failed to fetch email notifications:", error);
    res.status(500).json({ message: "Failed to fetch email notifications" });
  }
};

// Change notifcation setting for user
const updateEmailNotifications = async (req, res, next) => {
  const userId = req.params.userId;
  const { noteEmailNotifications, reservationEmailNotifications } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        noteNotifications: noteEmailNotifications,
        reservationNotifications: reservationEmailNotifications,
      },
      { new: true }
    );
    res.status(200).json({ message: "Updated" });
  } catch (error) {
    console.error("Failed to update email notifications:", error);
    res.status(500).json({ message: "Failed to update email notifications." });
  }
};

// get users
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  // res.json({ users: users.map((user) => user.toObject({ getters: true })) });
  res.status(200).json({ users: users });
};

// get user name by id
const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find a user for the provided id.",
      404
    );
    return next(error);
  }

  res.status(200).json({ user: user });
};

// signup
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      400
    );
    return next(error);
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later",
      500
    );
    return next(error);
  }

  if (existingUser) {
    return res.status(400).json({
      message: "User exists already, please login instead.",
    });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
    name,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in. please check your credentials and try again",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Logging up failed, please try again.", 500);
    return next(error);
  }

  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    // Generate JWT token with 15 minutes expiration time
    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const token = encodeURIComponent(jwtToken);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const passwordResetUrl = `${process.env.PASSWORDCHANGE_URL}${user.id}/${token}`;
    const passwordResetEmail = `
    <p>Hei ${user.name},</p>
    <p>Pyysit salasanan palautusta. Klikkaa alla olevaa linkkiä palauttaaksesi salasanan:</p>
    <a href=${passwordResetUrl}>Palauta salasana</a>
    <p>Tämä linkki toimii 15 minuuttia</p>
    <p>Jos et pyytänyt tätä salasanan palautusta, jätä tämä viesti huomiotta.</p>
    <p>Terveisin:</p>
    <p>Kukkarin insinööritiimi</p>
  `;

    await sendEmail(
      user,
      "Kukkari salasanan palautus pyyntö",
      passwordResetEmail
    );

    res.status(200).send({ message: "Salasanan palautus linkki lähetetty" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error " });
  }
};

const passwordReset = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      400
    );

    return next(error);
  }

  try {
    const { id, token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetPasswordToken: token });

    if (!user) {
      return res.status(400).send({ error: "Invalid reset token" });
    }
    // Check if reset token has expired
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).send({ error: "Reset token has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.status(200).send({ message: "Salasanan vaihto onnistui!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error " });
  }
};

exports.passwordReset = passwordReset;
exports.forgotPassword = forgotPassword;
exports.getUserById = getUserById;
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.updateEmailNotifications = updateEmailNotifications;
exports.getEmailNotifications = getEmailNotifications;
