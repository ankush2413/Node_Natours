const mongoose = require('mongoose');
const dotenv = require("dotenv");
const app = require("./app_2");

dotenv.config({ path: `${__dirname}/config.env` });
//console.log(app.get('env'));
//console.log(process.env);
//console.log(process.env.NODE_ENV);

mongoose.connect(process.env.DATABASE,{
     useNewUrlParser:true,
     useCreateIndex:true,
     useFindAndModify:false,
     useUnifiedTopology:true
})
.then(con=>{
     //console.log(con.connection);
     console.log("Database connected Succefully...");
})
.catch(err=>{
     console.log(err);
})


/*
const TestTour = new Tour({
     name: 'The Sea Shore'
});

TestTour.save()
.then(doc=>{
     console.log(doc);
     console.log('Collection Saved');
})
.catch(err=>{
     console.log("Error");
     console.log(err);
})
*/
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("App Running on Port");
});

process.on('unhandledRejection',err=>{
     console.log(err.name , err.message);
     console.log('Unhandled Rejection! Server Shutting Down');
     server.close(()=>{
          process.exit(1);
     })
});