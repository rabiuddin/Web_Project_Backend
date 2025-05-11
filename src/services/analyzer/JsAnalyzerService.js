// backend/src/analyzer.js
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { ApiError } from "../../utils/ApiError.js";
import { getResponseFromGemini } from "../gemini/geminiService.js";
import { ENABLE_GEMINI_SUGGESTIONS } from "../../constants.js";

const parseCode = (code) => {
  try {
    return parse(code, { sourceType: "module", errorRecovery: true });
  } catch (error) {
    throw new ApiError(400, "Invalid JavaScript syntax");
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

  traverse.default(ast, {
    FunctionDeclaration: {
      enter(path) {
        currentFunctionName = path.node.id?.name || null;
      },
      exit() {
        currentFunctionName = null;
      },
    },

    ForStatement: {
      enter() {
        loopStack.push("O(n)");
        updateMaxComplexity();
      },
      exit() {
        loopStack.pop();
      },
    },
    WhileStatement: {
      enter() {
        loopStack.push("O(n)");
        updateMaxComplexity();
      },
      exit() {
        loopStack.pop();
      },
    },
    DoWhileStatement: {
      enter() {
        loopStack.push("O(n)");
        updateMaxComplexity();
      },
      exit() {
        loopStack.pop();
      },
    },
    ForOfStatement: {
      enter() {
        loopStack.push("O(n)");
        updateMaxComplexity();
      },
      exit() {
        loopStack.pop();
      },
    },

    CallExpression(path) {
      const callee = path.node.callee;

      // ✅ Properly check for recursion
      if (callee.type === "Identifier" && callee.name === currentFunctionName) {
        maxComplexity = compareComplexity(maxComplexity, "O(2^n)");
      }

      // Built-in methods
      if (callee.type === "MemberExpression") {
        const method = callee.property?.name;
        if (method === "sort")
          maxComplexity = compareComplexity(maxComplexity, "O(n log n)");
        if (["map", "filter", "forEach", "indexOf"].includes(method)) {
          maxComplexity = compareComplexity(maxComplexity, "O(n)");
        }
      }
    },
  });

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
    const bi = complexityOrder.indexOf(b);
    return ai > bi ? a : b;
  };

  const updateSpace = (newComplexity) => {
    space = compareComplexity(space, newComplexity);
  };

  traverse.default(ast, {
    FunctionDeclaration: {
      enter(path) {
        currentFunctionName = path.node.id?.name || null;
      },
      exit() {
        currentFunctionName = null;
        maxRecursionDepth = Math.max(maxRecursionDepth, currentRecursionDepth);
        currentRecursionDepth = 0;
      },
    },

    CallExpression(path) {
      const callee = path.node.callee;
      if (callee.type === "Identifier" && callee.name === currentFunctionName) {
        // Proper recursion detection
        currentRecursionDepth += 1;
        updateSpace("O(n)"); // Assumes linear recursion stack usage
      }
    },

    ArrayExpression(path) {
      dataStructures.push("Array");
      updateSpace("O(n)");
    },
    ObjectExpression(path) {
      dataStructures.push("Object");
      updateSpace("O(n)");
    },
    NewExpression(path) {
      const callee = path.node.callee?.name;
      if (["Array", "Set", "Map", "Object"].includes(callee)) {
        dataStructures.push(callee);
        updateSpace("O(n)");
      }
    },
  });

  // If nested data structures were found (e.g., array of arrays)
  const nestedDataStructureCount = dataStructures.filter(
    (type, i, arr) => arr[i - 1] && arr[i - 1] === type && arr[i] === type
  ).length;

  if (nestedDataStructureCount >= 1) {
    updateSpace("O(n^2)");
  }

  // Adjust if recursion is very deep (assume worst-case exponential for now)
  if (maxRecursionDepth > 10) {
    updateSpace("O(2^n)");
  }

  return space;
};

const generateSuggestions = async (code) => {
  const suggestions = await getResponseFromGemini(JSON.stringify(code));
  return JSON.parse(suggestions);
};

export default async function calculateJsCodeAnalysis(code) {
  // parsing code in to a tree
  const ast = parseCode(code);
  console.log(ENABLE_GEMINI_SUGGESTIONS);
  return {
    timeComplexity: calculateTimeComplexity(ast),
    spaceComplexity: calculateSpaceComplexity(ast),

    suggestions: ENABLE_GEMINI_SUGGESTIONS
      ? await generateSuggestions(code)
      : [],
  };
}
