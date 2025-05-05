import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import {File} from "../models/file.model.js";
import {IsolatedVMWrapper} from "../utils/isolatedVM.js";

const executeFile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const fileId = req.params.id;

  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  const foundFile = await File.findOne({
    _id: fileId,
    user: userId
  });

  if (!foundFile) {
    throw new ApiError(404, "File Not Found");
  }

  console.log("File found:", foundFile);

  const fileContent = foundFile.content;
  
  if (!fileContent || fileContent.trim() === "") {
    throw new ApiError(400, "File content is empty");
  }

  try {
    const isolatedEnvironment = new IsolatedVMWrapper(fileContent);
    console.log("IsolatedVMWrapper initialized successfully");
    const { result, logs } = await isolatedEnvironment.run();
    console.log("Execution result:", result);
    console.log("Execution logs:", logs);
    return res.status(200).json(
      new ApiResponse(200, { result, logs }, "File executed successfully")
    );
  } catch (error) {
    console.error("Execution failed:", error.stack); // Log full stack trace
    throw new ApiError(500, `Execution error: ${error.message || "Unknown error during execution"}`);
  }

});

const analyzeFile = asyncHandler(async (req, res) => {

})


export{
  executeFile,
  analyzeFile
};