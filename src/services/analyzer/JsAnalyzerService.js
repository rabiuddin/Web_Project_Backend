// backend/src/analyzer.js
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { ApiError } from "../../utils/ApiError.js";

const parseCode = (code) => {
  try {
    return parse(code, { sourceType: "module", errorRecovery: true });
  } catch (error) {
    throw new ApiError(400, "Invalid JavaScript syntax");
  }
};

const calculateTimeComplexity = (ast) => {
  let maxComplexity = "O(1)";
  let loopDepth = 0;
  let hasRecursion = false;
  const complexities = [];

  const analyzeComplexity = (comp) => {
    if (!comp) return;
    const order = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)"];
    const currentIdx = order.indexOf(maxComplexity);
    const newIdx = order.indexOf(comp);
    if (newIdx > currentIdx) maxComplexity = comp;
    complexities.push(comp);
  };

  const analyzeLoopCondition = (node) => {
    if (!node) return "O(n)";
    // Simplified: Assume variable bounds (e.g., i < n) imply O(n)
    if (node.type === "BinaryExpression" && node.right?.type === "Identifier") {
      return "O(n)";
    }
    // Constant bounds (e.g., i < 100) imply O(1)
    if (node.right?.type === "NumericLiteral") {
      return "O(1)";
    }
    return "O(n)"; // Default
  };

  traverse.default(ast, {
    ForStatement(path) {
      loopDepth += 1;
      const loopComp = analyzeLoopCondition(path.node.test);
      analyzeComplexity(loopComp);
    },
    ForOfStatement() {
      loopDepth += 1;
      analyzeComplexity("O(n)"); // Iterates over collection
    },
    WhileStatement(path) {
      loopDepth += 1;
      const loopComp = analyzeLoopCondition(path.node.test);
      analyzeComplexity(loopComp);
    },
    DoWhileStatement(path) {
      loopDepth += 1;
      const loopComp = analyzeLoopCondition(path.node.test);
      analyzeComplexity(loopComp);
    },
    CallExpression(path) {
      const callee = path.node.callee;
      // Recursion
      if (
        callee.type === "Identifier" &&
        callee.name === path.scope.block?.name
      ) {
        hasRecursion = true;
        // Simplified: Check for tail recursion or binary recursion
        const parentFunc = path.scope.block;
        const hasMultipleCalls = parentFunc.body.body.some(
          (stmt) =>
            stmt.type === "ReturnStatement" &&
            stmt.argument?.type === "CallExpression"
        );
        analyzeComplexity(hasMultipleCalls ? "O(2^n)" : "O(n)");
      }
      // Built-in methods
      if (callee.type === "MemberExpression") {
        const method = callee.property?.name;
        if (method === "sort") analyzeComplexity("O(n log n)");
        if (["map", "filter", "forEach"].includes(method))
          analyzeComplexity("O(n)");
        if (method === "indexOf") analyzeComplexity("O(n)");
      }
    },
    "ForStatement|ForOfStatement|WhileStatement|DoWhileStatement": {
      exit() {
        loopDepth -= 1;
        if (loopDepth === 1 && complexities.includes("O(n)")) {
          analyzeComplexity("O(n²)");
        }
      },
    },
  });

  // Final adjustment for nested loops
  if (loopDepth === 0 && complexities.includes("O(n)") && !hasRecursion) {
    const loopCount = complexities.filter((c) => c === "O(n)").length;
    if (loopCount > 1) {
      analyzeComplexity(`O(n^${loopCount})`);
    }
  }

  return maxComplexity;
};

const calculateSpaceComplexity = (ast) => {
  let space = "O(1)";
  let dataStructureCount = 0;
  let recursionDepth = 0;

  const updateSpace = (newSpace) => {
    const order = ["O(1)", "O(n)", "O(n²)"];
    const currentIdx = order.indexOf(space);
    const newIdx = order.indexOf(newSpace);
    if (newIdx > currentIdx) space = newSpace;
  };

  traverse.default(ast, {
    ArrayExpression() {
      dataStructureCount += 1;
      updateSpace("O(n)");
    },
    ObjectExpression() {
      dataStructureCount += 1;
      updateSpace("O(n)");
    },
    NewExpression(path) {
      const callee = path.node.callee?.name;
      if (["Array", "Set", "Map"].includes(callee)) {
        dataStructureCount += 1;
        updateSpace("O(n)");
      }
    },
    CallExpression(path) {
      if (
        path.node.callee.type === "Identifier" &&
        path.node.callee.name === path.scope.block?.name
      ) {
        recursionDepth += 1;
        updateSpace("O(n)"); // Simplified: Assume linear recursion depth
      }
    },
  });

  // Adjust for recursion depth
  if (recursionDepth > 1 && dataStructureCount === 0) {
    updateSpace("O(n)");
  }

  return space;
};

const generateSuggestions = (ast) => {
  const suggestions = [];
  let loopDepth = 0;
  const variableUsages = new Map();

  const addSuggestion = (message, node) => {
    const loc = node?.loc ? ` at line ${node.loc.start.line}` : "";
    suggestions.push(`${message}${loc}`);
  };

  traverse.default(ast, {
    ForStatement(path) {
      loopDepth += 1;
      if (loopDepth > 1) {
        addSuggestion(
          "Consider using a hash map to reduce time complexity from O(n²) to O(n)",
          path.node
        );
      }
      // Check for nested array operations
      path.traverse({
        CallExpression(innerPath) {
          const callee = innerPath.node.callee;
          if (
            callee.type === "MemberExpression" &&
            ["indexOf", "includes"].includes(callee.property?.name)
          ) {
            addSuggestion(
              `Use a Set for O(1) lookup instead of ${callee.property.name} (O(n))`,
              innerPath.node
            );
          }
        },
      });
    },
    ForOfStatement(path) {
      loopDepth += 1;
      addSuggestion(
        "For-of loops may be slower than indexed loops for arrays; consider using a for loop if performance-critical",
        path.node
      );
    },
    VariableDeclarator(path) {
      const id = path.node.id.name;
      variableUsages.set(id, { referenced: false, node: path.node });
    },
    Identifier(path) {
      const name = path.node.name;
      if (
        variableUsages.has(name) &&
        path.node !== path.scope.getBinding(name).path.node.id
      ) {
        variableUsages.get(name).referenced = true;
      }
    },
    CallExpression(path) {
      const callee = path.node.callee;
      if (
        callee.type === "Identifier" &&
        callee.name === path.scope.block?.name
      ) {
        const parentFunc = path.scope.block;
        const hasMultipleCalls = parentFunc.body.body.some(
          (stmt) =>
            stmt.type === "ReturnStatement" &&
            stmt.argument?.type === "CallExpression"
        );
        if (hasMultipleCalls) {
          addSuggestion(
            "Consider memoization to optimize recursive function with exponential complexity",
            path.node
          );
        }
      }
    },
    FunctionDeclaration(path) {
      const params = path.node.params;
      if (params.length > 3) {
        addSuggestion(
          `Function has ${params.length} parameters; consider refactoring for clarity`,
          path.node
        );
      }
    },
    "ForStatement|ForOfStatement": {
      exit() {
        loopDepth -= 1;
      },
    },
  });

  // Check for unused variables
  variableUsages.forEach(({ referenced, node }, id) => {
    if (!referenced) {
      addSuggestion(`Remove unused variable: ${id}`, node);
    }
  });

  // Deduplicate suggestions
  return [...new Set(suggestions)];
};

export default async function calculateJsCodeAnalysis(code) {
  // parsing code in to a tree
  const ast = parseCode(code);
  return {
    timeComplexity: calculateTimeComplexity(ast),
    spaceComplexity: calculateSpaceComplexity(ast),
    suggestions: generateSuggestions(ast),
  };
}
