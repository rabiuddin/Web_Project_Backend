import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const signUp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "Please provide all the fields");
  }

  const foundUser = await User.findOne({ email });
  if (foundUser) {
    throw new ApiError(400, "Email already exists");
  }
  const foundUserByUsername = await User.findOne({ username });
  if (foundUserByUsername) {
    throw new ApiError(400, "Username already taken");
  }
  let profileImage;
  if (req.file?.path) {
    const imageURL = await uploadOnCloudinary(req.file.path);
    if (!imageURL) {
      throw new ApiError(500, "Error uploading image");
    }
    profileImage = imageURL.url; // Ensure the URL is extracted correctly
  }

  const user = await User.create({
    username,
    email,
    password,
    profileImage,
  });

  const token = user.generateAccessToken();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", token, options)
    .json(
      ApiResponse.Builder.statusCode(200)
        .data(user)
        .message("User created successfully")
        .build()
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide all the fields");
  }

  const foundUser = await User.findOne({ email });

  if (!foundUser) {
    throw new ApiError(400, "Invalid credentials");
  }

  const isMatch = await foundUser.isCorrectPassword(
    password,
    foundUser.password
  );

  if (!isMatch) {
    throw new ApiError(400, "Invalid credentials");
  }
  const token = foundUser.generateAccessToken();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", token, options)
    .json(
      ApiResponse.Builder.statusCode(200)
        .data(foundUser)
        .message("Logged In successfully")
        .build()
    );
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
  const user = req.user;

  const oldPassword = req.body?.oldPassword;
  const newPassword = req.body?.newPassword;
  const profileImage = req.file;

  // validate body
  if (!profileImage && !(oldPassword && newPassword)) {
    throw new ApiError(400, "No data provided to be updated");
  }

  // update password
  if (oldPassword && newPassword) {
    // check if incorrect old password
    const isMatch = await user.isCorrectPassword(oldPassword, user.password);

    if (!isMatch) {
      throw new ApiError(400, "Incorrect old password");
    }

    // check if newPassword is same as old
    if (newPassword === oldPassword) {
      throw new ApiError(
        400,
        "New Password can not be the same as old password"
      );
    }

    // if correct than update password
    user.password = newPassword;

    await user.save();
  }

  // update profile pic if sent
  if (profileImage) {
    const imageURL = await uploadOnCloudinary(profileImage.path);
    if (!imageURL) {
      throw new ApiError(500, "Error uploading image");
    }
    // setting image url to user
    user.profileImage = imageURL.url;

    await user.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const user = req.user;

  return res
    .status(200)
    .json(
      ApiResponse.Builder.statusCode(200)
        .data(user)
        .message("User Fetched successfully")
        .build()
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
  getUser,
};
