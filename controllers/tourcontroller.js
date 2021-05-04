const Tour = require('./../models/tourModel');
const multer = require('multer');
const sharp = require('sharp');
const fs= require('fs');
const app = require('../app_2.js');
const Asynccatch = require('./../utils/Asynccatch');
const AppError = require('../utils/apperror');
const tours = JSON.parse(fs.readFileSync('./starter/dev-data/data/tours-simple.json'));
const factory = require("./handlerFactory");
/*
exports.GetAllTours = (req,res)=>{
   
    res.status(200).json(
        {
            status:'success',
            data : {
                tours
            }  
        }
    )   
};
exports.checkbody = (req,res,next)=>{
    if(!req.body.name || !req.body.price)
    {
        return res.status(400).json({
            status:'fail',
            message:'Misiing name or price'
        });
    }
    next();

}
exports.GetTour = (req,res)=>{
    const id = req.params.id*1;
  const tour = tours.find(el=>el.id===id)
   if(!tour)
   {
       res.status(404).json(
           {
               status: 'fail',
               message:'Invalid'
           }
       )
   }
   else{
   res.status(200).json(
       {
           status:'success',
           data:{
               tour
           }
       }
   )
   }
};

exports.CreateTour = (req,res)=>{
    const newid = tours[tours.length - 1].id+1;
    console.log(newid);
    const newtour = Object.assign({id:newid},req.body);
    tours.push(newtour);
    fs.writeFile('./starter/dev-data/data/tours-simple.json',JSON.stringify(tours),err=>{
       console.log(newtour);
       res.status(201).json(
           {
               status:'success',
               data :{
                   added_tour : newtour
               }
           }
       )     
    });
   
};

exports.UpdateTour = (req,res)=>{
    if(req.params.id*1 > tours.length)
    {
         return res.status(404).json(
            {
                status: 'fail',
                message:'Invalid'
            }
        )
    }
      res.status(200).json({
          status:'success',
          data:{
             tour: "<Upated Tour...>"
          }
      })
};

exports.DeleteTour = (req,res)=>{
    res.status(204).json({
        status:'success',
        data:'null'
    });
};
/*
/*-------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------*/

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

exports.uploadTourImages = upload.fields([
    {name: 'imageCover',maxCount:1},
    {name:'images',maxCount: 3}
]);

exports.resizeTourImages = async (req,res,next)=>{
 
    if(!req.files.imageCover || !req.files.images) return next();
   const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    // 1)Cover Image
    await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90}).toFile(`${__dirname}/../public/img/tours/${imageCoverFilename}`);
    req.body.imageCover = imageCoverFilename;

    // 2) Images 
    req.body.images = []
    await Promise.all(req.files.images.map(async (file,i)=>{
        const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`

        await sharp(file.buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90}).toFile(`${__dirname}/../public/img/tours/${filename}`);

    req.body.images.push(filename);

    }));
  next();
}

class APIFeature{
    constructor(query,querystr)
    {
        this.query=query;
        this.querystr=querystr;
    }
    filter()
    {
        const queryobj = {...this.querystr};
        const excludefields= ['page','sort','limit','fields'];
         excludefields.forEach(el=> delete queryobj[el]);
       
         let querystr = JSON.stringify(queryobj);
         querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g,match=> `$${match}`);
         this.query = this.query.find(JSON.parse(querystr));
         return this;
    }
    sort()
    {
       if(this.querystr.sort)
      {
          const sortby = this.querystr.sort.split(',').join(' ');
          this.query = this.query.sort(sortby);
      }
      else{
          this.query = this.query.sort('-createdAt');
      }
      return this;
    }
    limitfield()
    {
        if(this.querystr.fields)
        {
            const field = this.querystr.fields.split(',').join(' ');
            this.query = this.query.select(field); 
        }
        else{
            this.query = this.query.select('-__v');
        }
        return this;
    }
    paginate()
    {
        const limt = this.querystr.limit*1 || 100;
        this.query = this.query.limit(limt);
        return this;
    }
}

exports.aliasTopTour = (req,res,next)=>{
    req.query.limit = '5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,summary,difficulty,ratingsAverage';
    next();
};

exports.CreateTour = factory.createOne(Tour);
/*
exports.CreateTour = Asynccatch(async (req,res,next)=>{
 
    const newtour = await Tour.create(req.body);

    res.status(201).json({
        status:'success',
        data :{
            tour: newtour
        }
    });
  /*
    try{
    const newtour = new Tour(req.body);
    //newtour.save();
    const newtour = await Tour.create(req.body);

    res.status(201).json({
        status:'success',
        data :{
            tour: newtour
        }
    });
     }
     catch (err){
        // console.log(err)
         res.status(400).json({
             status:'failed',
             message:'Invalid Data Sent'
         });
     }
     
}); */

exports.GetAllTours = factory.getAll(Tour);
/*
exports.GetAllTours = Asynccatch(async (req,res,next)=>{
    const features = new APIFeature(Tour.find(),req.query)
    .filter()
    .sort()
    .limitfield()
    .paginate()
    const _tours = await features.query;

    
    res.status(200).json({
        status:'success',
        results : _tours.length,
        data:{
            tour:_tours
        }
    })

   /* 
   try{
        /*
        //const _tours = await Tour.find();
        //const _tours = await find().where('duration').equals(5).where('difficulty').equals('easy')
    //    const queryobj = {...req.query};
    //    const excludefields= ['page','sort','limit','fields'];
    //     excludefields.forEach(el=> delete queryobj[el]);
      
    //    //Advacned Filtering
    //     //{difficult:'easy',duration:{$gte:5}}
    //     //{difficulty:'easy,duration:{gte:5}}
    //     let querystr = JSON.stringify(queryobj);
    //     querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g,match=> `$${match}`);

    //     let query = Tour.find(JSON.parse(querystr));
      //->Sorting
    //   if(req.query.sort)
    //   {
    //       const sortby = req.query.sort.split(',').join(' ');
    //       query = query.sort(sortby);
    //   }
    //   else{
    //       query = query.sort('-createdAt');
    //   }
      //->Fields/Selection
    //   if(req.query.fields)
    //   {
    //       const field = req.query.fields.split(',').join(' ');
    //       query = query.select(field); 
    //   }
    //   else{
    //       query = query.select('-__v');
    //   }
    // Limit
    // const limt = req.query.limit*1 || 100;
    // query = query.limit(limt);
    

       //->Execute Query
       const features = new APIFeature(Tour.find(),req.query)
       .filter()
       .sort()
       .limitfield()
       .paginate()
       const _tours = await features.query;

       
       res.status(200).json({
           status:'success',
           results : _tours.length,
           data:{
               tour:_tours
           }
       })
      }
      catch (err){
          console.log(err);
         res.status(400).json({
             status:'failed',
             message:err.message
         })
      } 
});*/

exports.GetTour = factory.getOne(Tour,{path:'reviews'});
/*
exports.GetTour = Asynccatch(async (req,res,next)=>{
    const tour = await (await Tour.findById(req.params.id)).populate('reviews');
    if(!tour)
    {
        return next(new AppError('No tour find with that ID',404));
    }
    res.status(200).json({
        status:'success',
        data :{
            tour
        }
    });
 /*
    try{
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status:'success',
            data :{
                tour
            }
        })
    }
    catch(err){
        res.status(400).json({
            status:'failed',
            message:err
        })
    }
}); */

exports.UpdateTour = factory.updateOne(Tour);
/*
exports.UpdateTour = Asynccatch(async (req,res,next)=>{
    const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })
    if(!tour)
    {
        return next(new AppError('No tour find with that ID',404));
    }
    res.status(200).json({
       status:'success',
       data :{
           tour
       }
   });
    /*try{
         const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
             new:true,
             runValidators:true
         })

         res.status(200).json({
            status:'success',
            data :{
                tour
            }
        })
     
    }
    catch(err){
        res.status(400).json({
            status:'failed',
            message:err
        })        
    }
});*/

/*
exports.DeleteTour = Asynccatch(async (req,res,next)=>{
    const tour  = await Tour.findByIdAndDelete(req.params.id);
    if(!tour)
    {
        return next(new AppError('No tour find with that ID',404));
    }
    res.status(204).json({
        status:'success',
        data:null
    });
    /*try{
            await Tour.findByIdAndDelete(req.params.id);
            res.status(204).json({
                status:'success',
                data:null
            })
       }
    catch(err){
        res.status(400).json({
            status:'failed',
            message:err
        })  
    } 
});*/


exports.DeleteTour = factory.deleteOne(Tour);

//tours-within/distance/233/center/-40,45/unit/mi
exports.getToursWithin = Asynccatch(async(req,res,next)=>{
    const {distance,latlng,unit} = req.params;
    const [lat,lng] = latlng.split(',');
    const radius = unit ==='mi'?distance/3963.2 : distance/6378.1 ;

    if(!lat || !lng)
    next(new AppError('Please Provide in the format lat,lng',400));

    const tours = await Tour.find({ startLocation: {$geoWithin: {$centerSphere:[[lng,lat],radius] } } });

    res.status(200).json({
        status:'success',
        results : tours.length,
        data:{
            data:tours
        }
    });
});