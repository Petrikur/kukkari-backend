const express = require('express');
const { check } = require('express-validator');

const router = express.Router();
const usersController = require("../controllers/users-controller")
const auth = require("../auth/auth");
const rateLimiter = require('../middleware/rateLimiter');

router.post("/forgotpassword", usersController.forgotPassword)
router.post("/:id/:token",usersController.passwordReset)

  router.post(
    '/signup',
    [
      check('name')
        .not()
        .isEmpty(),
      check('email')
        .normalizeEmail({gmail_remove_dots: false })
        .isEmail(),
      check('password').isLength({ min: 6 })
    ], rateLimiter,
    usersController.signup
  );

router.post('/login', usersController.login);
router.use(auth);
router.get('/:uid', usersController.getUserById);
router.get('/', usersController.getUsers);

module.exports = router;