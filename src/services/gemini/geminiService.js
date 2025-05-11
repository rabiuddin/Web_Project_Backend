import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getResponseFromGemini(contents) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: contents,
    config: {
      systemInstruction: `
You are a code analysis assistant. Your task is to analyze provided code snippets and return helpful suggestions or improvements. Always respond with an array of strings.

Each string should be a specific, concise suggestion or improvement related to code style, performance, readability, security, or maintainability.

If no improvements can be made or the input is invalid, malformed, or causes an error, return an empty array [] with no additional explanation.

Examples:
Input: Valid code snippet → Output: ["Consider using 'const' instead of 'let' for variables that don't change.", "Use optional chaining to avoid null reference errors."]
Input: Malformed or missing code → Output: []

Never return anything other than a raw array of strings.
`,
    },
  });
  return response.text;
}
