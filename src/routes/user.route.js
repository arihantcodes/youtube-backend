import { Router } from "express";

import { upload } from "../middlewares/multer.js";

import { verifyJWT } from "../middlewares/auth.js";
import {
  registerUser,
  loginUser,
  Logout,
  RefreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  UpdateUserDetails,
  UpdateUserCoverImage,
  UpdateUserAvatar,
  GetUserChannel,
  GetWatchHistory,
} from "../controllers/user.cont.js";



const router = Router();

router.route("/signup").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, Logout);
router.route("/refreshtoken").post(RefreshAccessToken);
router.route("/forgotpassword").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(verifyJWT, UpdateUserDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), UpdateUserAvatar);
router
  .route("/update-cover")
  .patch(verifyJWT, upload.single("coverImage"), UpdateUserCoverImage);
router.route("/c/:username").get(verifyJWT, GetUserChannel);
router.route("/watchhistory").post(verifyJWT, GetWatchHistory);

export default router;
