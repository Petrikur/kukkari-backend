const express = require("express");
const { check } = require("express-validator");
const reservationsController = require("../controllers/reservations-controller");
const router = express.Router();

const auth = require("../auth/auth");

// router.get('/:pid', reservationsController.getReservationById);
router.get("/", reservationsController.getAllReservations);
// router.get('/user/:uid', reservationsController.getReservationsByUserId);

router.use(auth);

router.post(
  "/",
  [
    check("startDate").not().isEmpty().toDate(),
    check("endDate").not().isEmpty().toDate(),
  ],
  reservationsController.createReservation
);

router.delete("/:pid", reservationsController.deleteReservation);

module.exports = router;
