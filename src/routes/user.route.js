import { Router } from "express";

import { upload } from "../middlewares/multer.js";

import { verifyJWT } from "../middlewares/auth.js";
import { registerUser, loginUser, Logout ,RefreshAccessToken} from "../controllers/user.cont.js";
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

export default router;
