import { executeCode, analyzeCode } from "../controllers/code.controllers.js";
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/execute", verifyJWT, executeCode);
router.post("/analyze", verifyJWT, analyzeCode);

export default router;
