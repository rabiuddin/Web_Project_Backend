import { executeFile,analyzeFile } from "../controllers/code.controllers";
import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/execute/:id", verifyToken, executeFile);
router.post("/analyze/:id", verifyToken, analyzeFile);