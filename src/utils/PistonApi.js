import fetch from "node-fetch";

const executeCode = async (code, filename) => {
try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        version: "18.15.0",
        files: [
          {
            name: filename,
            content: code,
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
    return result
  } catch (error) {
    console.error("Execution error:", error);
  }
}

export {executeCode}