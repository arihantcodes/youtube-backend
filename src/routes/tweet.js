import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
} from "../controllers/tweet.js";
const tweetRouter = Router();

tweetRouter.use(verifyJWT);

tweetRouter.route("/:userId").get(getUserTweets);
tweetRouter.route("/").post(createTweet);
tweetRouter.route("/update/:tweetId").patch(updateTweet);
tweetRouter.route("/delete/:tweetId").delete(deleteTweet);

export { tweetRouter };
