import { executeFile,analyzeFile } from "../controllers/code.controllers.js";
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/execute/:id", verifyJWT, executeFile);
router.post("/analyze/:id", verifyJWT, analyzeFile);

export default router;