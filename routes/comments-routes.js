const express = require("express");
const {check } = require("express-validator");

const rateLimiter = require("../middleware/rateLimiter")

const commentsController = require("../controllers/comments-controller");

const auth = require("../auth/auth")
const router = express.Router();

router.use(auth);
router.post("/",rateLimiter, commentsController.createComment);

router.delete("/:pid",commentsController.deleteComment)

module.exports = router;
