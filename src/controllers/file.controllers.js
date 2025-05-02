import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { File } from "../models/file.model.js";
import { MAX_FILES } from "../constants.js";

const createFile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const fileName = req.body?.fileName;
  if (!fileName) {
    throw new ApiError(400, "Filename is required.");
  }
  if (!fileName.includes(".")) {
    throw new ApiError(400, "The file needs to have an extension.");
  }
  const fileExtension = fileName.split(".").pop();
  const noOfUserFiles = await File.countDocuments({ user: userId });

  if (noOfUserFiles >= MAX_FILES) {
    throw new ApiError(400, `You cannot save more than ${MAX_FILES}`);
  }

  const newFile = await File.create({
    user: userId,
    name: fileName,
    extension: fileExtension,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newFile, "New File created successfully."));
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
    .json(new ApiResponse(200, file, "File found successfully."));
});

const getAllFiles = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const files = await File.find({ user: userId }, { content: 0 });

  return res
    .status(200)
    .json(new ApiResponse(200, files, "All files retreived Successfully."));
});

export { createFile, getOneFile, getAllFiles };
