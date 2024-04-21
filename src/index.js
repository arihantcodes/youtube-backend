import connectDB from "./db/dbconfig.js"
import dotenv from "dotenv"
import express from "express";
dotenv.config({
    path:'./env'
})


const app = express();
connectDB()


.then(() => {
    app.listen(process.env.PORT || 1009 ,()=>{
        console.log(`server is running at ${process.env.PORT}`)
    }
   
)
})
.catch((err) =>{
    console.log("mongoDB connection failed",err)
})

app.on("error",(error)=>{
    console.log("error",error)
    throw error
})