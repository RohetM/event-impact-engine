const { GoogleGenAI } = require("@google/genai");

// Initialize GoogleGenAI SDK
// API key extracted from loaded environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Runs a Gemini AI agent with a specific role and user input.
 * @param {string} systemPrompt - The system instruction defining the agent's role.
 * @param {string} userInput - The user's input or output from a previous agent.
 * @param {boolean} requireJson - Whether to enforce and parse a JSON response.
 * @returns {Promise<any>} - The text or parsed JSON output.
 */
async function runAgent(systemPrompt, userInput, requireJson = false) {
  try {
    const config = {
      systemInstruction: systemPrompt,
      temperature: 0.2,
    };

    if (requireJson) {
      config.responseMimeType = "application/json";
    }

    let response;
    let retries = 3;
    let delayMs = 2000;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: userInput,
          config: config
        });
        break; // Success
      } catch (err) {
        if (err.status === 503 || String(err).includes('503') || err.message?.includes('high demand') || err.status === 'UNAVAILABLE') {
          console.warn(`[Agent] 503 Unavailable. Retrying in ${delayMs}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          retries--;
          if (retries === 0) throw err;
        } else {
          throw err;
        }
      }
    }
    let outputText = response.text;

    if (requireJson) {
      try {
        // Find JSON block if wrapped in markdown
        const match = outputText.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          outputText = match[1];
        }
        return JSON.parse(outputText);
      } catch (parseError) {
        console.error("Agent failed to return valid JSON. Raw output:", response.text);
        throw new Error("Invalid JSON response from Agent.");
      }
    }

    return outputText;
  } catch (error) {
    console.error("Agent execution failed:", error.message);
    throw error;
  }
}

module.exports = {
  runAgent
};
