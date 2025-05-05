import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { executeCode } from "../utils/PistonApi.js";
import {ApiError} from "../utils/ApiError.js";
import {File} from "../models/file.model.js";

const executeFile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const fileId = req.params.id;

  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  const foundFile = await File.findOne({ _id: fileId, user: userId });

  if (!foundFile) {
    throw new ApiError(404, "File Not Found");
  }

  console.log("File found:", foundFile);

  const fileContent = foundFile.content;

  if (!fileContent || fileContent.trim() === "") {
    throw new ApiError(400, "File content is empty");
  }

  const result = await executeCode(fileContent, foundFile.name,foundFile.language);
  if (!result) {
    throw new ApiError(500, "Error executing code");
  }
  res.status(200).json(
     new ApiResponse(200, result ,"Code executed successfully")
  )
});

const analyzeFile = asyncHandler(async (req, res) => {

})


export{
  executeFile,
  analyzeFile
};