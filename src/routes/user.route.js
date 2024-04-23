import { Router } from "express";
import registerUser from "../controllers/user.cont";

const router = Router();

router.post('/register', registerUser);

export default router;
