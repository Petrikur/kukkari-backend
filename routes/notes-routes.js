const express = require("express");
const { check } = require("express-validator");

const notesController = require("../controllers/notes-controller");

const auth = require("../auth/auth");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();
router.get("/", notesController.getAllNotes);

router.get('/:id/comments', notesController.getComments);
router.use(auth);
router.get("/:pid", notesController.getNoteById);

router.post(
  "/newnote",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("name").isLength({ min: 2 }),
  ], rateLimiter,
  notesController.createNote
);

router.delete("/:pid", notesController.deleteNote);
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  notesController.updateNote
);

module.exports = router;
