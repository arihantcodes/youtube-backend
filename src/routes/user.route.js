import { Router } from "express";
import registerUser from "../controllers/user.cont.js";
import {upload} from "../middlewares/multer.js"
const router = Router();

router.route('/signup').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1

        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

export default router;
