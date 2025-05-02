import express from "express";
import { deleteFile,updateFile } from "../controllers/file.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.delete("/:id",verifyJWT, deleteFile);
router.patch("/:id",verifyJWT, updateFile);

export default router;