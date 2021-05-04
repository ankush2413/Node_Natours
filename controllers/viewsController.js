const User = require('../models/usermodel');
const Asynccatch = require('../utils/Asynccatch');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');

exports.getOverview = Asynccatch(async (req,res)=>{
    //1)Get Tour data from collection
     const tours = await Tour.find();

    //2)Build Template

    //3)Render that template using tour data from step 1
    res.status(200).render('overview',{
        title:'All Tours',
        tours
    });
});

exports.getTour = Asynccatch(async (req,res,next)=>{
    //1)get the data, for the requested tour(including reviews and guides)
    console.log("Received");
     const tour = await Tour.findOne({slug:req.params.slug}).populate({
         path:'reviews',
         fields:'review rating user'
     })
    //2)Build the templates
    //console.log(tour);
    //3)Render template using the data from step1
    console.log(tour);
    res.status(200).render('tour',{
        title:`${tour.name}`,
        tour
    });
});

exports.getLoginForm = (req,res)=>{
   res.status(200).render('login',{
       title:"Log Into Your Account"
   })
}
exports.getAccount = (req,res)=>{
   res.status(200).render('account',{
       title:'Your account'
   })
}
exports.getMyTours = Asynccatch(async(req,res,next)=>{
    // 1) Find all bookings
     const bookings = await Booking.find({user: req.user.id});

    //2) Find tours with the returned Ids
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({_id:{ $in: tourIds } });

    res.status(200).render('overview',{
        title:'My Tours',
        tours
    })
});

exports.updateUserData = Asynccatch(async (req,res,next) => {
   const updatedUser = await User.findByIdAndUpdate(req.user.id,{
       name:req.body.name,
       email:req.body.email
   },{
       new:true,
       runValidators:true
   });
   res.status(200).render('account',{
    title:'Your account',
    user:updatedUser
})
});