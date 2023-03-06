const express = require("express");
const { check } = require("express-validator");

const notesController = require("../controllers/notes-controller");

const auth = require("../auth/auth");

const router = express.Router();
router.get("/", notesController.getAllNotes);

router.use(checkAuth);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("name").isLength({ min: 2 }),
  ],
  notesController.createNote
);

module.exports = router;
