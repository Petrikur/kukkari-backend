const express = require('express');
const { check } = require('express-validator');

const usersController = require("../controllers/users-controller")
const router = express.Router();
const auth = require("../auth/auth");

router.post("/forgotpassword", usersController.forgotPassword)
router.post("/:id/:token",usersController.passwordReset)

router.post(
  '/signup',
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);
router.use(auth);
router.get('/:uid', usersController.getUserById);
router.get('/', usersController.getUsers);

module.exports = router;