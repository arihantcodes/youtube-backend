import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.js";
import uploadonCloudnary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
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
  console.log(req.files?.avatar[0]?.path);
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
      $set: {
        RefreshToken: undefined,
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
  .clearCookie("AccessToken",options)
  .clearCookie("RefreshToken",options)
  .json(new ApiResponse(200,{},"user Logout Success"))
});

export default { registerUser, loginUser, Logout };
