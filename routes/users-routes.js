const express = require('express');
const { check } = require('express-validator');

const usersController = require("../controllers/users-controller")

const auth = require("../auth/auth");
const router = express.Router();

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
