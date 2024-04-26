import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

import { User } from "../models/user";

export const verifyJWT = asyncHandler(async (req, _, next) => {
try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        throw new ApiError(401, "Unauthorized request");
      }
    
      //  todo if error add await
      const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
      const user = await User.findById(decodeToken?._id).select(
        "-password -RefreshToken"
      );
    
      if (!user) {
        throw new ApiError(400, "Invalid accesss ");
      }
    
      req.user = user;
      next();
} catch (error) {
    throw new ApiError(403,error.message ||"Invalid accesss Token")
}
});
