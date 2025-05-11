import { parse } from "python-ast";
import { ApiError } from "../../utils/ApiError.js";
import { getResponseFromGemini } from "../gemini/geminiService.js";
import { ENABLE_GEMINI_SUGGESTIONS } from "../../constants.js";

const parseCode = (code) => {
  try {
    return parse(code);
  } catch (error) {
    throw new ApiError(400, "Invalid Python syntax");
  }
};

const calculateTimeComplexity = (ast) => {
  let loopStack = [];
  let currentFunctionName = null;

  const complexityOrder = [
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n log n)",
    "O(n^2)",
    "O(n^3)",
    "O(2^n)",
  ];
  const compareComplexity = (a, b) => {
    const ai = complexityOrder.indexOf(a);
    const bi = complexityOrder.indexOf(b);
    return ai > bi ? a : b;
  };

  let maxComplexity = "O(1)";

  const updateMaxComplexity = () => {
    if (loopStack.length === 0) return;
    const nLoops = loopStack.length;
    const newComplexity = `O(n^${nLoops})`;
    maxComplexity = compareComplexity(maxComplexity, newComplexity);
  };

  const traverse = (node) => {
    if (!node) return;

    switch (node.type) {
      case "FunctionDef":
        currentFunctionName = node.name || null;
        node.body?.forEach(traverse);
        currentFunctionName = null;
        break;

      case "For":
      case "While":
        loopStack.push("O(n)");
        updateMaxComplexity();
        node.body?.forEach(traverse);
        loopStack.pop();
        break;

      case "Call":
        // Recursion check
        if (
          node.func?.type === "Name" &&
          node.func.id === currentFunctionName
        ) {
          maxComplexity = compareComplexity(maxComplexity, "O(2^n)");
        }

        // Built-in methods
        if (node.func?.type === "Attribute") {
          const method = node.func.attr;
          if (method === "sort") {
            maxComplexity = compareComplexity(maxComplexity, "O(n log n)");
          }
          if (["append", "pop", "remove", "index"].includes(method)) {
            maxComplexity = compareComplexity(maxComplexity, "O(n)");
          }
        }
        // Global functions like sorted
        if (node.func?.type === "Name" && node.func.id === "sorted") {
          maxComplexity = compareComplexity(maxComplexity, "O(n log n)");
        }

        node.args?.forEach(traverse);
        node.keywords?.forEach((kw) => traverse(kw.value));
        break;

      default:
        // Traverse child nodes
        for (const key in node) {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else if (
            typeof node[key] === "object" &&
            node[key] !== null &&
            key !== "loc"
          ) {
            traverse(node[key]);
          }
        }
    }
  };

  traverse(ast);
  return maxComplexity;
};

const calculateSpaceComplexity = (ast) => {
  let space = "O(1)";
  let currentFunctionName = null;
  let maxRecursionDepth = 0;
  let currentRecursionDepth = 0;
  let dataStructures = [];

  const complexityOrder = ["O(1)", "O(n)", "O(n^2)", "O(2^n)"];

  const compareComplexity = (a, b) => {
    const ai = complexityOrder.indexOf(a);
    const bi = complexityOrder.index(b);
    return ai > bi ? a : b;
  };

  const updateSpace = (newComplexity) => {
    space = compareComplexity(space, newComplexity);
  };

  const traverse = (node) => {
    if (!node) return;

    switch (node.type) {
      case "FunctionDef":
        currentFunctionName = node.name || null;
        node.body?.forEach(traverse);
        maxRecursionDepth = Math.max(maxRecursionDepth, currentRecursionDepth);
        currentRecursionDepth = 0;
        currentFunctionName = null;
        break;

      case "Call":
        if (
          node.func?.type === "Name" &&
          node.func.id === currentFunctionName
        ) {
          currentRecursionDepth += 1;
          updateSpace("O(n)");
        }
        if (
          node.func?.type === "Name" &&
          ["list", "dict", "set"].includes(node.func.id)
        ) {
          dataStructures.push(node.func.id);
          updateSpace("O(n)");
        }
        node.args?.forEach(traverse);
        node.keywords?.forEach((kw) => traverse(kw.value));
        break;

      case "List":
      case "Dict":
      case "Set":
        dataStructures.push(node.type);
        updateSpace("O(n)");
        if (node.elts) node.elts.forEach(traverse);
        if (node.keys) node.keys.forEach(traverse);
        if (node.values) node.values.forEach(traverse);
        break;

      default:
        for (const key in node) {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else if (
            typeof node[key] === "object" &&
            node[key] !== null &&
            key !== "loc"
          ) {
            traverse(node[key]);
          }
        }
    }
  };

  traverse(ast);

  // Check for nested data structures
  const nestedDataStructureCount = dataStructures.filter(
    (type, i, arr) => arr[i - 1] && arr[i - 1] === type && arr[i] === type
  ).length;

  if (nestedDataStructureCount >= 1) {
    updateSpace("O(n^2)");
  }

  if (maxRecursionDepth > 10) {
    updateSpace("O(2^n)");
  }

  return space;
};

const generateSuggestions = async (code) => {
  const suggestions = await getResponseFromGemini(JSON.stringify(code));
  return JSON.parse(suggestions);
};

export default async function calculatePythonCodeAnalysis(code) {
  const ast = parseCode(code);
  return {
    timeComplexity: calculateTimeComplexity(ast),
    spaceComplexity: calculateSpaceComplexity(ast),
    suggestions: ENABLE_GEMINI_SUGGESTIONS
      ? await generateSuggestions(code)
      : [],
  };
}
