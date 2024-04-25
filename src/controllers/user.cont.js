import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.js";
import {uploadonCloudnary} from "../utils/cloudinary.js";

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
  console.log(ExistedUser);

  if (ExistedUser) {
    throw new ApiError(400, "User already exists");
  }
  console.log(req.files?.avatar[0]?.path);
  const avatar = req.files?.avatar[0]?.path;
  const coverIamage = req.files?.coverImage[0]?.path;

  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }
});

export default registerUser;
