import { Router } from "express";
import registerUser from "../controllers/user.cont.js";
import { upload } from "../middlewares/multer.js";
import loginUser from "../controllers/user.cont.js";
import Logout from "../controllers/user.cont.js";
import  {verifyJWT}  from "../middlewares/auth.js";
let router = Router();

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

export default router;
 