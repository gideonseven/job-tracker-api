import { Router } from "express";
import { asyncWrapper } from "../middleware/errorHandler.js";

import {
    listApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
} from "../controllers/application.js";

const router = Router();
router.get("/", asyncWrapper(listApplications));
router.get("/:id", asyncWrapper(getApplication));
router.post("/", asyncWrapper(createApplication));
router.put("/:id", asyncWrapper(updateApplication));
router.delete("/:id", asyncWrapper(deleteApplication));
export default router;