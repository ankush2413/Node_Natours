const multer = require('multer');
const sharp  = require('sharp');
const User = require('../models/usermodel');
const Asynccatch = require('../utils/Asynccatch');
const Apperror = require('./../utils/apperror');
const factory = require("./handlerFactory");

// const multerStorage = multer.diskStorage({
//   destination: (req,file,cb) =>{
//       cb(null,'pubic/img/users')
//   },
//   filename : (req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    console.log('0');
    cb(null,true);
  }
  else{
    cb(new Apperror('Not an image! Please upload only images',400),false)
  }
}

const upload = multer({
  storage:multerStorage,
  fileFilter:multerFilter
});

exports.uploadUserPhoto = upload.single('photo')
exports.resizeUserPhoto = async (req,res,next)=>{
  
   if(!req.file)return next();
   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
   
    await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90}).toFile(`${__dirname}/../public/img/users/${req.file.filename}`);
  
    next();
    
}

const filterobj = (obj,...allowedFields)=>{
  const newobj = {};
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
}
//---
// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach(el => {
//     if (allowedFields.includes(el)) newObj[el] = obj[el];
//   });
//   return newObj;
// };
//---
exports.getMe = (req,res,next)=>{
   req.params.id = req.user.id;
   next();
}

exports.updateMe = Asynccatch (async(req,res,next)=>{
  //1)Create error if user post password data
  
  if(req.body.password || req.body.passwordconfirm){
    return (next(new Apperror('This route is not for password update.Please use /updatePassword.',400)));
  }
  //2)Update user document
  
  const filterbody = filterobj(req.body,'name','email');
  console.log('5');
  if(req.file) filterbody.photo  = req.file.filename;
  console.log('4');
 
//----
const updatedUser = await User.findByIdAndUpdate(req.user.id, filterbody, {
  new: true,
  runValidators: true
});
//---

  console.log('6');
  res.status(200).json({
    status: 'success',
    data : {
      user : updatedUser
    }
  });
});

exports.deleteMe = Asynccatch(async (req,res,next)=>{
  await User.findByIdAndDelete(req.user.id,{active:false})
  res.status(204).json({
    status:'success',
    data : null
  });
});

exports.getAllUsers = factory.getAll(User);
/*
exports.getAllUsers = async (req, res,next) => {
  const users = await User.find();
    res.status(200).json({
      status: 'success',
      results : users.length,
      data : {
        users
      }
    });
  };*/
  exports.getUser = factory.getOne(User);
  /*
  exports.getUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  }; */
  exports.createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!Please use Signup instead'
    });
  };
  // exports.updateUser = (req, res) => {
  //   res.status(500).json({
  //     status: 'error',
  //     message: 'This route is not yet defined!'
  //   });
  // };
  //Do not update passwords with this
  exports.updateUser = factory.updateOne(User);
  exports.deleteUser = factory.deleteOne(User)
  // exports.deleteUser = (req, res) => {
  //   res.status(500).json({
  //     status: 'error',
  //     message: 'This route is not yet defined!'
  //   });
  // };
  