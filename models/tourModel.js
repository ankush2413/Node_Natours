const mongoose = require('mongoose');
const User = require('./usermodel');
const Review = require('./reviewModel');
const slugify = require('slugify');
const tourschema = mongoose.Schema({
    name: {
         type: String,
         required : [true,'Tour name cannot be empty'],
         unique : true,
         trim:true
    },
    slug:String,
    duration:{
       type:Number,
       required:[true,'A Tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A Tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A Tour must have a difficulty']
    },
    price: {
          type : Number,
          required : [true,'Sorry,Tour must have a Price']
    },
    priceDiscount:Number,
    ratingsAverage:{
         type:Number,
         default:4.5,
         min:[1,'Ratings must be above 1'],
         max:[6,'Ratings must be below 6'],
         set: val => Math.round(val*10)/10
    },
    ratingsQuantity:{
       type:Number,
       default:0
    },
    rating: {
         type: Number,
         default : 4.5
    },
    summary:{
         type:String,
         trim:true,
         required:[true,'A Tour must have a Summary']
    },
    description:{
         type:String,
         trim:true
    },
    imageCover:{
         type:String,
         required:[true,'A Tour must have a cover image']
    },
    images:[String],
    createdAt:{
         type: Date,
         default:Date.now(),
         select : false
    },
    startDates: [Date],
    startLocation :{
         // GeoJSON
         type:{
            type:String,
            default :'Point',
            enum :['Point']
         },
         coordinates: [Number],//Longitude,latitude
         address: String,
         description : String 
    },
    locations :[
         {
              type:{
                   type:String,
                   default :'Point',
                   enum:['Point']
              },
              coordinates : [Number],
              address :String,
              description :String,
              day:Number
         }
    ],
    //guides : Array
     guides :[
      {
           type : mongoose.Schema.ObjectId,
           ref : 'User'
      }
     ]
}
// {
//      toJSON : {virtuals :true},
//      toObject : { virtuals :true}
 );

 tourschema.set('toObject', { virtuals: true })
 tourschema.set('toJSON', { virtuals: true })
tourschema.virtual('reviews',{
     ref: 'Review',
     foreignField : 'tour',
     localField : '_id'
});

tourschema.index({startLocation:'2dsphere'});
tourschema.index({ slug: 1 });
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourschema.pre('save', function(next) {
     this.slug = slugify(this.name, { lower: true });
     next();
   });
tourschema.pre(/^find/,function(next){
     this.populate({path:'guides',select : '-__v --passwordChangedAt'});
     next();
});




// tourschema.pre('save',async function(next){
//      const guidesPromises = this.guides.map(async id => await User.findById(id));
//      this.guides = await Promise.all(guidesPromises);
//      next();
// });

const Tour = mongoose.model('Tour',tourschema);
module.exports = Tour;