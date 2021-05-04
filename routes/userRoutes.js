const express = require('express');
const multer = require('multer');
const usercontroller = require('./../controllers/usercontroller');
const authcontroller = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');


//--------------------------------------------------------------------------------------------------------
const router = express.Router();
const upload = multer({dest:`${__dirname}/../public/img/users`});

router.get('/me',authcontroller.protect,usercontroller.getMe,usercontroller.getUser);

router.post('/signup',authcontroller.signup);
router.post('/login',authcontroller.login);
router.get('/logout',authcontroller.logout);
router.post('/forgot',authcontroller.forgotPassword);
router.patch('/reset/:token',authcontroller.resetPassword);

router.patch('/updateMyPassword',authcontroller.protect,authcontroller.updatePassword);
router.patch('/updateMe',authcontroller.protect,usercontroller.uploadUserPhoto,usercontroller.resizeUserPhoto,usercontroller.updateMe);
router.delete('/deleteMe',authcontroller.protect,usercontroller.deleteMe);

router.use(authcontroller.protect);    
router.use(authcontroller.restrictTo('admin'));
router
   .route('/')
   .get(usercontroller.getAllUsers)
   .post(usercontroller.createUser);
router                 
   .route('/:id')
   .patch(usercontroller.updateUser)
   .delete(usercontroller.deleteUser)
   .get(usercontroller.getUser);

   
module.exports = router; 