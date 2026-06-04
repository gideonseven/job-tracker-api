import { Router } from "express";
import {
    listApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
} from "../controllers/application.js";

const router = Router();
router.get("/", listApplications);
router.get("/:id", getApplication);
router.post("/", createApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;