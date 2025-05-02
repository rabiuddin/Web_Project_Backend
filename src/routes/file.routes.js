import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createFile,
  getOneFile,
  getAllFiles,
} from "../controllers/file.controllers.js";

const router = express.Router();

router.post("/create", verifyJWT, createFile);
router.get("", verifyJWT, getAllFiles);
router.get("/:id", verifyJWT, getOneFile);

export default router;
