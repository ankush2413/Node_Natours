const stripe = require('stripe')('sk_test_51ImYbSSEFy7uH8de4TEJSemAglwd2gfYY5UdTTjM8q0hFOEvkERrMrpWxb2151SJbCJegqVfrusnesfxTfNGOOCi00cTIRx3yW');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const AsyncCatch = require('./../utils/Asynccatch'); 
const AppError = require('./../utils/apperror');
const factory = require('./handlerFactory');


exports.getCheckOutSession = AsyncCatch(async(req,res,next)=>{
  // 1) Get the currently Booked Tour
  const tour = await Tour.findById(req.params.tourId);

  // 2)Create ChechOut Session
     const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
          cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
          customer_email: req.user.email,
          client_reference_id: req.params.tourId,
          line_items: [
              {
                  name:`${tour.name} Tour`,
                  description: tour.summary,
                  images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                  amount: tour.price * 100,
                  currency: 'usd',
                  quantity: 1
              }
          ]
      })
       // 3)Create session as response

       res.status(200).json({
           status: ' success',
           session
       })
});

exports.createBookingCheckout = AsyncCatch(async (req,res,next)=>{
    //This is only temporary,because its unsecure,everyone can making booking without payment
    
    const {tour,user,price} = req.query;
    
    if(!tour && !user && !price) return next()
    await Booking.create({tour,user,price});

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);