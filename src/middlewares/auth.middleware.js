import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, "Unauthorized: No user found with this token");
    }
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
});
