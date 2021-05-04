const path= require('path');
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan"); // A third pary Middle Ware
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/apperror');
const GlobalErrorHandler  = require('./controllers/errorcontroller');
const reviewrouter = require('./routes/reviewRoutes');
const bookingrouter = require('./routes/bookingRoutes');
const tourrouter = require("./routes/tourRoutes");
const userrouter = require("./routes/userRoutes");
const viewRouter = require('./routes/viewRoutes');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp =require('hpp');
const cookieParser = require('cookie-parser');
const app = express();

//Template Engine
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

//Body Parser,reading data from body into rq.body



app.use(express.json({limit: '10kb'}));
dotenv.config({ path: `${__dirname}/config.env` });

//Dat sanitization against Nosql query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

//Security HTTP headers
app.use(helmet({
    whitelist : ['duration','ratingsQuantity','ratingsAverage','difficulty','price']
}));


//Prevent Parameter Pollution
app.use(hpp());

if (process.env.NODE_ENV === "development") 
app.use(morgan("dev"));

// Limit request from same API
const limiter  = rateLimit({
    max: 100,
    windowMS:60*60*1000,
    message: 'Too many request from this IP,plesae try again in an hour!' 
});
app.use('/api',limiter);


//Serving Static file
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser());
app.use(express.urlencoded({ extended:true, limit: '10kb'}));
//Routes
app.use((req, res, next) => {
    res.header("Content-Security-Policy","script-src *" )
    next();
   })
app.use("/api/v1/tours", tourrouter);
app.use("/api/v1/user", userrouter);
app.use("/api/v1/reviews",reviewrouter);
app.use("/api/v1/booking",bookingrouter);
app.use("/",viewRouter);

app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message: `Can't find the ${req.originalUrl} at this server`
    // })

    next(new AppError(`Can't find the ${req.originalUrl} at this server`,404));
})

app.use(GlobalErrorHandler);
module.exports = app;
