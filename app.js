const fs= require('fs');
const express = require('express');
const morgan = require('morgan'); // A third pary Middle Ware

const app = express();
app.use(express.json());  // app.use is used to call a middle ware function, we also create our own middle ware
                          // express.json returns a middleware function
                          /*app.use((req,res,next)=>{
                              console.log(HI am middleware);
                              req.requestTime = new Time.toISIOstring();
                              next(); // TO call the next function in the middel ware stack
                            }) */
                            
app.use(morgan('dev')); // Shows the request on the conole

const port = 3000;

// TO start a server app.listen()

// app.get('/',(req,res)=>{
//    // res.status(200).send("Hi, Coming from Server Side")
//     res.status(200).json({message:'Hello, I am JSON',app:'I am App'});
// })

// app.post('/',(req,res)=>{
//    res.send("you can post this to the URL...");
// })

const tours = JSON.parse(fs.readFileSync('./starter/dev-data/data/tours-simple.json'));

//-------------------------------Routes-------------------------
app.get('/api/v1/tours',(req,res)=>{
   
    res.status(200).json(
        {
            status:'success',
            data : {
                tours
            }  
        }
    )   
});

app.get('/api/v1/tours/:id',(req,res)=>{
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
});

app.post('/api/v1/tours',(req,res)=>{
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
    
});

app.patch('/api/v1/tours/:id',(req,res)=>{
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
});

app.delete('/api/v1/tours/:id',(req,res)=>{
     res.status(204).json({
         status:'success',
         data:'null'
     })
});
//-------------------------------------------------------------------------------------------------------------
//-----------------------------------Refratoring Routes--------------------------------------------------------
const GetAllTours = (req,res)=>{
   
    res.status(200).json(
        {
            status:'success',
            data : {
                tours
            }  
        }
    )   
};

const GetTour = (req,res)=>{
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

const CreateTour = (req,res)=>{
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

const UpdateTour = (req,res)=>{
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

const DeleteTour = (req,res)=>{
    res.status(204).json({
        status:'success',
        data:'null'
    })
};
/*
app.get('/api/v1/tours',GetAllTours);
app.get('/api/v1/tours/:id',GetTour);
app.post('/api/v1/tours',CreateTour);
app.patch('/api/v1/tours:id',UpdateTour);
app.delete('/api/v1/tours:id',DeleteTour);
*/

app.route('/api/v1/tours').get(GetAllTours).post(CreateTour);
app.route('/api/v1/tours/:id').get(GetTour).patch(UpdateTour).delete(DeleteTour);

//-------------------------------------------------------------------------------------------------------------
app.listen(port,()=>{
    console.log("App Running on Port")
})                