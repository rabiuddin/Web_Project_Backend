import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createFile,
  getOneFile,
  getAllFiles,
  deleteFile,
  updateFile
} from "../controllers/file.controllers.js";

const router = express.Router();

router.post("/create", verifyJWT, createFile);
router.get("", verifyJWT, getAllFiles);
router.get("/:id", verifyJWT, getOneFile);
router.delete("/:id",verifyJWT, deleteFile);
router.patch("/:id",verifyJWT, updateFile);

export default router;
