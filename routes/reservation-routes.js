const express = require('express');
const { check } = require('express-validator');
const reservationsController = require("../controllers/reservations-controller")
const router = express.Router();

// router.get('/:pid', reservationsController.getReservationById);
router.get("/",reservationsController.getAllReservations);
// router.get('/user/:uid', reservationsController.getReservationsByUserId);

router.post(
  '/',
  [
    check('start')
    .not()
    .isEmpty().toDate(),
    check('title')
    .not()
    .isEmpty(),
  ],
  reservationsController.createReservation
);


router.delete('/:pid', reservationsController.deleteReservation);

module.exports = router;
