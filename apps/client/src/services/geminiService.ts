import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiHistoryItem } from "@repo/types";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const sendMessageToGemini = async (
  newMessage: string,
  history: GeminiHistoryItem[]
): Promise<string> => {
  if (!apiKey) {
    console.error("❌ API Key is missing! Check your .env.local file.");
    throw new Error("API Key is missing");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(newMessage);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    throw error;
  }
};
