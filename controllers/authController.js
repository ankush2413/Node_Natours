const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User  = require('./../models/usermodel');
const Asynccatch = require('./../utils/Asynccatch');
const Apperror = require('./../utils/apperror');
const Email =  require('./../utils/email');
const cookieOptions = {
    expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
    httpOnly : true
}
const signtoken = id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES_IN});
}
const createsendToken = (user,statuscode,res)=>{
    const token  = signtoken(user._id) 
    if(process.env.NODE_ENV === 'production')cookieOptions.secure = true;
    res.cookie('jwt',token,cookieOptions);
    
    //Remove password from output
    user.password = undefined;
    res.status(statuscode).json({
        status:'success',
        token,
        data:{
            user
        }
       
    });
}
exports.signup = Asynccatch(async (req,res,next)=>{
    const newuser = await User.create(req.body);
    const url=`${req.protocol}://${req.get('host')}/me`;
    await new Email(newuser,url).sendWelcome();
    createsendToken(newuser,201,res);
    next();
});

exports.login = Asynccatch(async (req,res,next)=>{
    const {email,password} = req.body;
    
    if(!email || !password)
    return next(new Apperror('Please provide email and password',400))
 
    const user = await User.findOne({email}).select('+password');

    
    if(!user || !(await user.correctpassword(password,user.password)))
    {return next(new Apperror('Incorrect email or password',401));}
 
    createsendToken(user,200,res);
    // const token  = signtoken(user._id)
    // res.status(200).json({
    //     status: "success",
    //     token
    // });
});

// Only for render pages,no errors!
exports.isLoggedIn = async(req,res,next)=>{
       
    if(req.cookies.jwt){
        
    try{
    //Verification Of Token
   const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);

   //Check if user still exists
   const freshUser = await User.findById(decoded.id);
//    console.log(freshUser);
console.log('freshUser');
   if(!freshUser){
       return next();
   }
   // Check if user changed password after the token was issued
   if(freshUser.changePasswordAfter(decoded.iat))
   {return next();}
  
// There is a logged in user

  res.locals.a = freshUser;
  //console.log(req.locals.user);
   return next();
}
catch(err){
    return next();
}
}
next();
};

exports.logout =(req,res)=>{
    res.cookie('jwt','logget Out',{
        expires: new Date(Date.now()+10*1000),
        httpOnly:true
    })
    res.status(200).json({
        status:'success'
    });
}

exports.protect = Asynccatch(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    
    if(!token)
    {
        return next(new Apperror('You are not Logged IN! Please Log IN',401));
    }
    //Verification Of Token
   const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

   //Check if user still exists
   const freshUser =await User.findById(decoded.id);
   if(!freshUser){
       return next(new Apperror('The user belonging to token no more exist',401));
   }
   // Check if user changed password after the token was issued
   if(freshUser.changePasswordAfter(decoded.iat))
   {return new Apperror('User recently changed Password',401);}
    req.user = freshUser;
    res.locals.a = freshUser;
    next();
});

exports.restrictTo = (...roles) =>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role))
        {
            return next(new Apperror('You do not have permission to perform this action',403));
        }
        next();
    }
}

exports.forgotPassword =  Asynccatch(async (req,res,next)=>{
    //1) Get User based on Posted email
    const user  = await User.findOne({email: req.body.email});
    if(!user){ return next(new Apperror('There is no user with that email address',404));}

    //2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    // 3)Send it users email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot Your Password? Submit a Patch request with your new Password to ${resetURL}`;
    try{
    // await sendEmail({
    //     email:user.email,
    //     subject : 'Your Password reset token(valid for 10 min)',
    //     message : message
    // });
    await new Email(user,resetURL).sendPasswordReset();
    res.status(200).json({
        status:'success',
        mesage: 'Token sent to email'
    });
     }
     catch (err){
         user.passwordResetToken =undefined;
         user.passwordResetExpires = undefined;
         await user.save({validateBeforeSave:false});
         return next(new Apperror(`There was an error sending the email.Please try again later:: ${err}`,500));
     }
});
exports.resetPassword = Asynccatch(async (req,res,next)=>{
              //1) Get user based on the token
              const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

              const user = await User.findOne({passwordResetToken:hashedToken,passwordResetExpires: {$gt: Date.now()}});
              //2)If token has not expired, and there is user , set the new password
              if(!user)
              {
                  return next(new Apperror('Token is Invalid or has expired',400));
              }
              user.password = req.body.password;
              user.passwordconfirm = req.body.passwordconfirm;
              user.PasswordResetToken = undefined;
              user.passwordResetExpires = undefined;
              await user.save();
              //3)Update changePasswordAt property for the user
              //4)Log the user in,send JWT
              createsendToken(user,200,res);
            //   const token  = signtoken(user._id)
            // res.status(200).json({
            //      status: "success",
            //      token
            // }); 
});
exports.updatePassword = Asynccatch(async (req,res,next)=>{
    //1)Get User from Collection
     const user  = await User.findById(req.user.id).select('+password');
     
    //2)check If posted current password is correct
    if(!(await user.correctpassword(req.body.passwordcurrent,user.password))){
        return next(new Apperror('Your current password is wrong',401));
    }
    //3)If so , update Password
    user.password  = req.body.password;
    user.passwordconfirm = req.body.password;
    await user.save();
    //4)Log user in ,send JWT
    createsendToken(user,200,res);
});