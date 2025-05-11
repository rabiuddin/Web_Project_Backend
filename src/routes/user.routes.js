import express from "express";
import {
  signUp,
  login,
  logout,
  changePassword,
  generateAccessToken,
  updateUser,
  getUser,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/signup", upload.single("profileImage"), signUp);
router.post("/login", login);
router.put(
  "/update-user",
  verifyJWT,
  upload.single("profileImage"),
  updateUser
);
router.post("/logout",  verifyJWT,logout);
router.post("/change-password", verifyJWT, changePassword);
router.get("/user", verifyJWT, getUser);

export default router;
