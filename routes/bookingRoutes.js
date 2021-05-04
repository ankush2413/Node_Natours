const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/checkout-session/:tourId',authController.protect,bookingController.getCheckOutSession)
router.use(authController.protect);

router
    .route('/')
    .get(bookingController.getAllBooking)
    .post(bookingController.createBooking);
router.route('/:id').get(bookingController.getBooking).patch(bookingController.updateBooking);

module.exports = router;