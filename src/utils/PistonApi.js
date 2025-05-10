import fetch from "node-fetch";

const languageVersions = {
  python: "3.10.0",
  cpp: "10.2.0",
  javascript: "18.15.0",
  go: "1.16.2",
  java: "15.0.2",
  rust: "1.68.2",
};

const executeCodeFromPiston = async (code, filename, language) => {
  try {
    const languageVersion = languageVersions[language] || "latest";
    console.log("Language version:", languageVersion);
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: language,
        version: languageVersion,
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
    return result;
  } catch (error) {
    console.error("Execution error:", error);
  }
};

export { executeCodeFromPiston };
