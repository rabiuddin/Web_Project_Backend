import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const signUp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "Please provide all the fields");
  }

  // Check for duplicate email or username
  if (await User.findOne({ email })) {
    throw new ApiError(400, "Email already exists");
  }
  if (await User.findOne({ username })) {
    throw new ApiError(400, "Username already taken");
  }

  // Handle optional profile image upload
  let profileImage;
  if (req.file?.path) {
    const imageURL = await uploadOnCloudinary(req.file.path);
    if (!imageURL) {
      throw new ApiError(500, "Error uploading image");
    }
    profileImage = imageURL.url;
  }

  // Create the user
  const user = await User.create({
    username,
    email,
    password,
    profileImage,
  });

  // Exclude password from returned user
  const createdUser = await User.findById(user._id).select("-password");

  // Generate JWT access token
  const token = jwt.sign(
    { userId: createdUser._id, username: createdUser.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  // Return user + token
  return res.status(201).json({
    success: true,
    message: "User created successfully",
    user: createdUser,
    accessToken: token,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide all the fields");
  }

  // 1) Find the user
  const foundUser = await User.findOne({ email }).select("+password");
  if (!foundUser) {
    throw new ApiError(400, "Invalid credentials");
  }

  // 2) Check password
  const isMatch = await foundUser.isCorrectPassword(
    password,
    foundUser.password
  );
  if (!isMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  // 3) Generate token
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT_SECRET is not defined in environment");
  }
  const token = jwt.sign(
    { userId: foundUser._id, username: foundUser.username },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  // 4) Prepare cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 1000 * 60 * 60, // 1 hour
  };

  // 5) Remove password before sending user object
  const userToReturn = foundUser.toObject();
  delete userToReturn.password;

  // 6) Send cookie + JSON
  return res.status(200).cookie("accessToken", token, cookieOptions).json({
    success: true,
    message: "Login successful",
    accessToken: token,
    user: userToReturn,
  });
});

const logout = asyncHandler(async (req, res) => {
  //get user id from the middleware
  const id = req.user._id;
  //not necessary but validate the user
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  //clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, "Logout successful", {})); //send 200
});

const updateUser = asyncHandler(async (req, res) => {
  const id = req.body.userId;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const { username, email } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "Please provide all the fields");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser._id.toString() !== id.toString()) {
    throw new ApiError(400, "Email already in use by another account");
  }

  user.username = username;
  user.email = email;

  await user.save();

  const { password, ...updatedUser } = user.toObject();
  return res
    .status(200)
    .json(
      new ApiResponse(200, "User updated successfully", { user: updatedUser })
    );
});

const generateAccessToken = asyncHandler(async (req, res) => {});

const generateRefreshToken = asyncHandler(async (req, res) => {});

const changePassword = asyncHandler(async (req, res) => {
  // get email and password and new password from req.body
  //validate email
  //find the user against email
  //check if password is correct
  //update the new password as password
  //save the user
  //send 200
});

export {
  signUp,
  login,
  logout,
  generateAccessToken,
  generateRefreshToken,
  changePassword,
  updateUser,
};
