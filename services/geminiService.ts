
import { GoogleGenAI } from "@google/genai";

// Initialize with a named parameter using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an AI response using gemini-3-flash-preview for text tasks.
 */
export const generateAIResponse = async (prompt: string, context: string = ''): Promise<string> => {
  try {
    // Model selection based on task type: Summarization/Simple Q&A -> gemini-3-flash-preview
    const model = 'gemini-3-flash-preview'; 
    
    const finalPrompt = `
      You are Cordis AI, a smart and witty assistant in a modern communication app.
      Context: ${context}
      User: "${prompt}"
      
      Reply concisely. Use markdown. Be helpful but have personality.
    `;

    // Use ai.models.generateContent to query the model with both name and prompt
    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
    });

    // Access the text property directly on the response object
    return response.text || "I'm processing that thought... give me a moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I lost connection to the neural link. Try again later.";
  }
};
