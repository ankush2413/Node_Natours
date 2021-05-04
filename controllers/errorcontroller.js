const AppError = require('./../utils/apperror');
const handleCasterror = (err)=>{
    const message = `Invalid ${err.path}:${err.value}`;
    return new AppError(message,400);
};
const duplicatefieldsDB = err =>{
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    
    const message = `Duplicate field value : ${value}.Please use another value`;
    return new AppError(message,400);
}
const errorsenddev = (err,res)=>{
    res.status(err.statusCode).json({
        status : err.status,
        //error:error,
        message : err.message
        //stack :   err.stack
    });
}
const errorsendprod = (err,res)=>{

    if(err.isOperational){
    res.status(err.statusCode).json({
        status : err.status,
        message : err.message,
    })
    } 
    else  // Programing error or other unknown error
    {
        console.error("Error: ",err);
        res.status(500).json({
            status: 'fail',
            message: 'Something went vey wrong!'
        })
    }
}
const handleJWTError = err => new AppError('Invalid Token.Please Log in again',401);
const handleJWTExpiredError = err => new AppError('Your Token has expired: Please Log in again',401);

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'fail';

    if(process.env.NODE_ENV === 'development')
    {
       errorsenddev(err,res);
    }
    else{
        let error = {...err};
        if(error.name === 'CastError')error = handleCasterror(error); // Invalid Get Request
        if(error.code === 11000) error = duplicatefieldsDB(error);    // Insert duplicate name
        if(error.name==='JsonWebTokenError')error = handleJWTError(error);
        if(error.name === 'TokenExpiredError')error = handleJWTExpiredError(error);
        errorsendprod(error,res);  
    }
  
    next();
}