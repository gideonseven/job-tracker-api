import { Router } from "express";
import { signup } from "../controllers/auth.js";
import { asyncWrapper } from "../middleware/errorHandler.js";

const router = Router();

router.post("/signup", asyncWrapper(signup));

export default router;