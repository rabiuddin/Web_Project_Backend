// routes/auth.routes.js

import express from "express";
import {
  signUp,
  login,
  logout,
  changePassword,
  generateAccessToken,
  generateRefreshToken,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/refresh-token", generateRefreshToken);
router.post("/access-token", generateAccessToken);

router.post("/logout", verifyJWT, logout);
router.post("/change-password", verifyJWT, changePassword);

export default router;
