import connectDB from "./db/dbconfig.js";
import dotenv from "dotenv";
import express from "express";
dotenv.config({
  path: "./env",
});
const PORT = process.env.PORT || 3000;
const app = express();
connectDB();
try {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.log("mongoDB connection failed", err);
}

app.on("error", (error) => {
  console.log("error", error);
  throw error;
});
