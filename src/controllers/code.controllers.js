import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { executeCodeFromPiston } from "../utils/PistonApi.js";
import { ApiError } from "../utils/ApiError.js";
import { ALLOWED_LANGUAGES, DEFAULT_LANGUAGE } from "../constants.js";
import calculateJsCodeAnalysis from "../services/analyzer/JsAnalyzerService.js";

const executeCode = asyncHandler(async (req, res) => {
  const { content, language = DEFAULT_LANGUAGE } = req.body;

  if (!ALLOWED_LANGUAGES.includes(language)) {
    throw new ApiError(
      400,
      "Invalid or not allowed language, Allowed: " + ALLOWED_LANGUAGES
    );
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "File content is empty");
  }

  const result = await executeCodeFromPiston(content, "", language);

  if (!result) {
    throw new ApiError(500, "Error executing code");
  }
  res
    .status(200)
    .json(new ApiResponse(200, result, "Code executed successfully"));
});

const analyzeCode = asyncHandler(async (req, res) => {
  const { content, language = DEFAULT_LANGUAGE } = req.body;

  if (!ALLOWED_LANGUAGES.includes(language)) {
    throw new ApiError(
      400,
      "Invalid or not allowed language, Allowed: " + ALLOWED_LANGUAGES
    );
  }

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  // redirect to language specific service
  let analysis;
  switch (language) {
    case "javascript":
      analysis = await calculateJsCodeAnalysis(content);
      break;
    // more can be added here
    default:
      break;
  }

  res
    .status(200)
    .json(
      ApiResponse.Builder.statusCode(200)
        .data(analysis)
        .message("Analyzed code successfully")
        .build()
    );
});

export { executeCode, analyzeCode };
