import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS,
    credentials: true,
  })
);

app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import { tweetRouter } from "./routes/tweet.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);

app.on("error", (error) => {
  console.log("Error on the server", error);
});

export default app;
