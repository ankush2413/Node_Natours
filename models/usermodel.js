const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userschema = new mongoose.Schema({
    name : {
        type: String,
        required : [true,'Please Enter your name']
    },
    email :{
        type : String,
        required:[true,'Please Enter your e-mail address'],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail,'Please enter a valid e-mail address']
    },
    photo : {
             type:String,
             default:'default.jpg'
            },
    role:{
        type:String,
        enum : ['user','guide','lead-guide','admin'],
        default : 'user'
    },
    password: {
        type:String,
        required : true,
        minlength : 8,
        select : false
    },
    passwordconfirm : {
        type: String,
        required:8,
        minlength:8,
        validate : {
            validator : function(el){
                return el===this.password;
            },
            message : "Passwords are not same!"
        } 
    },
    passwordChangedAt: Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active : {
        type : Boolean,
        default :true,
        select :false
    }
});
userschema.pre('save',async function(next){
        if(!this.isModified('password'))return next();
        this.password = await bcrypt.hash(this.password,12);

        this.passwordconfirm = undefined;
        next();

});
userschema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew)return next();

    this.passwordChangedAt = Date.now() -1000;
    next();
});
userschema.pre(/^find/,function(next){
    this.find({active : true});
    next();
});
userschema.methods.correctpassword = async function(candidatepassword,userpassword){
    return await bcrypt.compare(candidatepassword,userpassword);
}
userschema.methods.changePasswordAfter = function (JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() /1000);
        return JWTTimestamp < changedTimestamp;
    }
    //False means Not changed
    return false;
}

userschema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex');
 this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
 this.passwordResetExpires = Date.now()+ 10*60*1000;
 
 return resetToken;
}
const User  = mongoose.model('User',userschema);
module.exports = User;
