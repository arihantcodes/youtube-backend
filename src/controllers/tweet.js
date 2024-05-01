import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.js";
import { User } from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  await User.findById(req.user._id);
  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });
  console.log(tweet);
  return res
    .status(201)
    .json(new ApiResponse(201, { tweet }, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "provide Userid ");
  }

  console.log(userId);

  const Tweets = await Tweet.find({
    owner: userId,
  });

  if (!Tweets) {
    throw new ApiError(404, "No tweet found");
  }

  return res.status(200).json(new ApiResponse(200, Tweets, "All tweets "));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { content } = req.body;
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tweetId is required");
  }
  if (!content) {
    throw new ApiError(400, "provide content for update");
  }

  const updatetweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatetweet, "Tweet Details updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "give tweet id for delete");
  }
  const deleteted = await Tweet.findByIdAndDelete(tweetId);
  return res
    .status(200)
    .json(new ApiResponse(200, deleteted, "Tweet Delete Succesfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
