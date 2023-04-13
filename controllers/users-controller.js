const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");

// const Error = require("../models/http-error");
const User = require("../models/User");
const HttpError = require("../models/http-error")

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
    user = await User.findById(userId, "name");
  } catch (err) {
    const error = new HttpError(
      "Fetching user failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find a user for the provided id.", 404);
    return next(error);
  }

  res.json({ name: user.name });
};

// signup
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
      const error  = new HttpError("Invalid inputs passed, please check your data.")
      error.statusCode = 400;
      return next(error)
  
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
      message: "User exists already, please login instead."
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

  res.status(201).json({ userId: createdUser.id, email:createdUser.email, token:token, name});
};

const login = async (req, res, next) => {
  console.log(req.body)
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
        "Invalid credentials, could not log you in."
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
      token:token
    });
  };
exports.getUserById = getUserById;
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
