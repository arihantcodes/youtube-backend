import connectDB from "./db/dbconfig.js"
import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})

console.log(process.env.PORT,"SERVER")

connectDB()