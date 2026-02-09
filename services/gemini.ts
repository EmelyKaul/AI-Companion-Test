import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from "../types";

// Initialize the API client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Du bist ein freundlicher, empathischer Begleiter für eine Forschungsstudie. 
Deine Aufgabe ist es, ein kurzes, unterstützendes Gespräch zu führen. 
Halte deine Antworten eher kurz und gesprächig (max 2-3 Sätze). 
Du bist kein Therapeut, sondern ein neutraler Zuhörer.
Sprich Deutsch.`;

export const getAIResponse = async (history: Message[], newMessage: string): Promise<string> => {
  try {
    // Transform internal message history to Gemini format
    // Filter out messages that might be invalid or system notifications if we had them
    const historyForModel = history.map(msg => ({
      role: msg.sender === Sender.USER ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: historyForModel
    });

    const result = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "Entschuldigung, ich habe das nicht verstanden.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Entschuldigung, es gab ein Verbindungsproblem. Bitte versuche es später noch einmal.";
  }
};