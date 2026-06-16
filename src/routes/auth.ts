import { Router } from "express";
import { signup, login } from "../controllers/auth.js";
import { asyncWrapper } from "../middleware/errorHandler.js";

const router = Router();

router.post("/signup", asyncWrapper(signup));
router.post("/login", asyncWrapper(login));

export default router;