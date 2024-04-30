import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.js";
import uploadonCloudnary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const AccessToken = user.generateAccessToken();
    const RefreshToken = user.generateRefreshToken();

    user.RefreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });

    return { AccessToken, RefreshToken };
  } catch (error) {
    throw new ApiError(500, "Something Went Wrong While generating Token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (fullname == "") {
    throw new ApiError(400, "fullbname is required");
  }
  if (username == "") {
    throw new ApiError(400, "username is required");
  }
  if (email == "") {
    throw new ApiError(400, "email is required");
  }
  if (password == "") {
    throw new ApiError(400, "password is required");
  }

  const ExistedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (ExistedUser) {
    throw new ApiError(400, "User already exists");
  }

  const avatarLocal = req.files?.avatar[0]?.path;

  let coverIamageLocal;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverIamageLocal = req.files.coverImage[0].path;
  }

  if (!avatarLocal) {
    throw new ApiError(400, "avatar is required");
  }

  const avatar = await uploadonCloudnary(avatarLocal);
  const coverImage = await uploadonCloudnary(coverIamageLocal);
  if (!avatar) {
    throw new ApiError(400, "avatar File upload failed");
  }

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const registerUser = await User.findById(user._id).select(
    "-password,-RefreshToken"
  );

  if (!registerUser) {
    throw new ApiError(500, "Error in Register a User");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, registerUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is Required ");
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const isPassword = await user.isPasswordCorrect(password);

  if (!isPassword) {
    throw new ApiError(402, "Incorrect Password");
  }

  const { AccessToken, RefreshToken } =
    await generateAccessTokenandRefreshToken(user._id);

  const LogUser = await User.findById(user._id).select(
    "-password -RefreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("AccessToken", AccessToken, options)
    .cookie("RefreshToken", RefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: LogUser, AccessToken, RefreshToken },
        "User Logged In Successfully"
      )
    );
});

const Logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        RefreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const RefreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.RefreshToken || req.body.RefreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauth request");
  }

  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOEKN_SECRET
    );

    const user = await User.findById(decodeToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token ");
    }

    if (incomingRefreshToken !== user?.RefreshToken) {
      throw new ApiError(401, " Refresh Token is Exp");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    // error aa sakti ha refresh token mai
    const { AccessToken, RefreshToken } =
      await generateAccessTokenandRefreshToken(user._id);

    return res
      .status(200)
      .cookie("RefreshToken", RefreshToken, options)
      .cookie("AccessToken", AccessToken, options)
      .json(
        new ApiResponse(
          200,
          { AccessToken, RefreshToken },
          "Access TOken Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || " Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, conformPassword } = req.body;

  if (newPassword !== conformPassword) {
    throw new ApiError(404, "Conform Password not match with new Password ");
  }

  const user = await User.findById(req.user?._id);

  const ispassword = await user.isPasswordCorrect(oldPassword);
  if (!ispassword) {
    throw new ApiError(404, "Invalid Password");
  }
  user.password = conformPassword;
  await user.save({ validateBeforeSave: false });
 
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password change Succesfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched Succesfully"));
});

const UpdateUserDetails = asyncHandler(async (req, res) => {
  const { fullname, username } = req.body;


  if (!fullname && !username) {
    throw new ApiError(404, "Provide at least one detail to update");
  }


  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        username,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details updated"));
});

const UpdateUserAvatar = asyncHandler(async (req, res) => {
  const AvatarLocalPath = req.file?.path;

  if (!AvatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadonCloudnary(AvatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading Avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: trrue,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Image Upload Succesfully"));
});
const UpdateUserCoverImage = asyncHandler(async (req, res) => {
  const CoverLocalPath = req.file?.path;

  if (!CoverLocalPath) {
    throw new ApiError(400, "Cover file is missing");
  }

  const coverImage = await uploadonCloudnary(CoverLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading cover");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: trrue,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover Image Upload Succesfully"));
});

const GetUserChannel = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is Missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscriberdTO",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        ChannelSubscribeTo: {
          $size: "$subscriberdTO",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscriberCount: 1,
        ChannelSubscribeTo: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
 

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exis");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "user channel fetched SuccesFully"));
});

const GetWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
 

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history Fetched Succesfully"
      )
    );
});




export {
  registerUser,
  loginUser,
  Logout,
  RefreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  UpdateUserAvatar,
  UpdateUserDetails,
  UpdateUserCoverImage,
  GetUserChannel,
  GetWatchHistory,
};
