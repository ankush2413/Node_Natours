const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../models/tourModel');
const Review = require('./../models/reviewModel');
const User = require('./../models/usermodel');

dotenv.config({ path: `${__dirname}/../config.env` });
console.log(process.env.DATABASE);
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
})
.then(con=>{
    //console.log(con.connection);
    console.log("Database connected Succefully...");
})
.catch(err=>{
    console.log(err);
})

// READ JSON FILE
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8')
);
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8')
);
const user = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Review.create(review);
    await Tour.create(tours);
    await User.create(user,{validateBeforeSave:false});

    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Review.deleteMany();
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
