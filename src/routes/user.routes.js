import express from "express";
import {
  signUp,
  login,
  logout,
  changePassword,
  generateAccessToken,
  updateUser,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/signup", upload.single("profileImage"), signUp);
router.post("/login", login);
router.put("/update-user", updateUser);
router.post("/logout", logout);
router.post("/change-password", verifyJWT, changePassword);

export default router;
