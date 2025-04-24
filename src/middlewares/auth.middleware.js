// middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Store user info for use in controllers
    // console.info("Token verified successfully:", decoded);
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
};
