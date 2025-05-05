import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import {File} from "../models/file.model.js";
import fetch from "node-fetch";

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

  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        version: "18.15.0",
        files: [
          {
            name: "main.js",
            content: fileContent,
          },
        ],
        stdin: "",
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });

    const result = await response.json();

    console.log("Execution result:", result);

    res.status(200).json({
      output: result.run?.stdout || "",
      stderr: result.run?.stderr || "",
      code: result.run?.code,
      compile_output: result.compile?.stdout || "",
      compile_error: result.compile?.stderr || "",
      language: result.language,
      version: result.version,
    });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ error: "Failed to execute code", details: error.message });
  }
});

const analyzeFile = asyncHandler(async (req, res) => {

})


export{
  executeFile,
  analyzeFile
};