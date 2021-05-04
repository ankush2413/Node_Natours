const { populate } = require("../models/usermodel");
const Asynccatch = require("../utils/Asynccatch");
const AppError = require("./../utils/apperror");

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



exports.deleteOne = Model =>Asynccatch(async (req,res,next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);
    
    if(!doc)
    {
        return next(new AppError('No document find with that ID',404));
    }
    res.status(204).json({
        status:'success',
        data:null
    });
});

exports.updateOne = Model => Asynccatch(async (req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })
    if(!doc)
    {
        return next(new AppError('No document find with that ID',404));
    }
    res.status(200).json({
       status:'success',
       data :{
           data: doc
       }
   });
});

exports.createOne = Model => Asynccatch(async (req,res,next)=>{
 
    const doc = await Model.create(req.body);

    res.status(201).json({
        status:'success',
        data :{
            data: doc
        }
    });
});

exports.getOne = (Model,popOptions) => Asynccatch(async (req,res,next)=>{
    let query =  Model.findById(req.params.id);
    if(popOptions)query = query.populate(popOptions);
    const doc =await query;

    if(!doc)
    {
        return next(new AppError('No document find with that ID',404));
    }
    res.status(200).json({
        status:'success',
        data : doc     
    });
});

exports.getAll = Model => Asynccatch(async (req,res,next)=>{

    // To Allow for nested Get reviews on tour
    let filter ={}
    if(req.params.tourId)filter = {tour:req.params.tourId};

    const features = new APIFeature(Model.find(filter),req.query)
    .filter()
    .sort()
    .limitfield()
    .paginate()
    const doc = await features.query;

    
    res.status(200).json({
        status:'success',
        results : doc.length,
        data:{
            data : doc
        }
    })
});