const express = require("express");
const {check } = require("express-validator");

const commentsController = require("../controllers/comments-controller");

const auth = require("../auth/auth")
const router = express.Router();

router.use(auth);
router.post("/", commentsController.createComment);

router.delete("/:pid",commentsController.deleteComment)

module.exports = router;
