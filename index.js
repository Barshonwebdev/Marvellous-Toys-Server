const express = require('express');
const cors = require('cors');
const app=express();
app.use(cors());
require('dotenv').config();
const port=process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(express.json());

//api
app.get('/',(req,res)=>{
    res.send('running')
})

app.listen(port,()=>{
    console.log(`listening at port ${port}`)
})



//mongodb

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7di2jdk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //all toys api
    const alltoysCollection=client.db('toydb').collection('alltoys');
   

    //categorized toys api
    app.get('/shop', async(req,res)=>{
      let query={};
      if(req.query?.sub_category){
        query={sub_category:req.query.sub_category};
      }

      const result=await alltoysCollection.find(query).toArray();
      res.send(result);
    })
    
    //all toys api
    app.get('/all',async(req,res)=>{
      const search=req.query.search;
      const query={name:{$regex:search,$options:'i'}};
      console.log(search);
      const cursor=alltoysCollection.find(query);
      const result=await cursor.toArray();
      res.send(result);
    })

    //single toy detail api
    app.get('/details/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result= await alltoysCollection.findOne(query);
      res.send(result);
    })
    //single figure update data get api
    app.get('/my/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result= await alltoysCollection.findOne(query);
      res.send(result);
    })

    //my toys api
    app.get('/my',async(req,res)=>{ 
      const sort=req.query.sort;
      let query={};
      if(req.query?.selleremail){
        query={selleremail:req.query.selleremail}
      }
      const options= {
        sort:{
          "price": sort=== 'asc'? 1 : -1
        }
      }
      const result=await alltoysCollection.find(query,options).toArray();
      res.send(result);
    })

    //my toys delete api
    app.delete('/my/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result=await alltoysCollection.deleteOne(query);
      res.send(result);
    })

    // toy update api
    app.patch('/my/:id',async(req,res)=>{
      const updatedFigure=req.body;
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const newFigureData={
        $set:{
          price:updatedFigure.price,
          available_quantity:updatedFigure.available_quantity,
          description:updatedFigure.description,
        }
      };

      const result=await alltoysCollection.updateOne(filter,newFigureData);
      res.send(result);
    })
    //add figurine api
    app.post('/add', async(req,res)=>{
      const singleFigurine=req.body;
      console.log(singleFigurine);
      const result=await alltoysCollection.insertOne(singleFigurine);
      res.send(result);
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
