const express = require('express')
const tourcontroller = require('./../controllers/tourcontroller');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();


//router.route('/:tourId/review').post(authController.protect,authController.restrictTo('user'),reviewController.createReview); 
router.use('/:tourId/review',reviewRouter)

router.route('/top-5-cheap').get(tourcontroller.aliasTopTour,tourcontroller.GetAllTours);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourcontroller.getToursWithin);
router
    .route('/')
    .get(authController.protect,tourcontroller.GetAllTours)
    .post(authController.protect,authController.restrictTo('admin','lead-guide'),tourcontroller.CreateTour);

router
   .route('/:id')
   .get(tourcontroller.GetTour)
   .patch(authController.protect,tourcontroller.uploadTourImages,tourcontroller.resizeTourImages,tourcontroller.UpdateTour)
   .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourcontroller.DeleteTour);

 

module.exports = router;