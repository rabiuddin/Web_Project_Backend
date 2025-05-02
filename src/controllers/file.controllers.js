import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { File } from "../models/file.model.js";
import { MAX_FILES } from "../constants.js";

const createFile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const noOfUserFiles = await File.countDocuments({ user: userId });

  if (noOfUserFiles >= MAX_FILES) {
    throw new ApiError(400, `You cannot save more than ${MAX_FILES}`);
  }

  const newFile = await File.create({ user: userId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { file: newFile }, "New File created successfully.")
    );
});

const getOneFile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const fileId = req.params.id;

  const file = await File.findOne({ _id: fileId, user: userId });

  if (!file) {
    throw new ApiError(400, "There is no file with the given ID");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { file }, "File found successfully."));
});

const getAllFiles = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const files = await File.find({ user: userId }).select("name");

  return res
    .status(200)
    .json(new ApiResponse(200, files, "All files retreived Successfully."));
});

export { createFile, getOneFile, getAllFiles };
