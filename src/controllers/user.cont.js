import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.js";
import uploadonCloudnary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { response } from "express";
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

  const ExistedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  // console.log(ExistedUser);

  if (ExistedUser) {
    throw new ApiError(400, "User already exists");
  }
  console.log(req.files?.avatar[0]?.path);
  const avatarLocal = req.files?.avatar[0]?.path;
  const coverIamageLocal = req.files?.coverImage[0]?.path;

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
    "-password,-refreshToken"
  );
  console.log(registerUser);

  if (!registerUser) {
    throw new ApiError(500, "Error in Register a User");
  }

  return response
    .status(201)
    .json(new ApiResponse(200, registerUser, "User Registered Successfully"));
});

export default registerUser;
