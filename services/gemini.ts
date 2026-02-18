import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from "../types";

const SYSTEM_INSTRUCTION = `Du bist ein freundlicher, empathischer Begleiter für eine Forschungsstudie. 
Deine Aufgabe ist es, ein kurzes, unterstützendes Gespräch zu führen. 
Halte deine Antworten eher kurz und gesprächig (max 2-3 Sätze). 
Du bist kein Therapeut, sondern ein neutraler Zuhörer.
Sprich Deutsch.`;

export const getAIResponse = async (history: Message[], newMessage: string): Promise<string> => {
  try {
    // Strictly retrieve the API key from the environment variable as per guidelines.
    // Ensure your deployment environment (e.g. Vercel, Netlify, Docker) has API_KEY set.
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("Configuration Error: process.env.API_KEY is missing.");
      return "Systemhinweis: Der API-Schlüssel wurde nicht gefunden. Bitte Konfiguration prüfen.";
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Transform internal message history to Gemini format
    const historyForModel = history.map(msg => ({
      role: msg.sender === Sender.USER ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Initialize chat with the optimized model for basic text tasks
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

    return result.text || "Ich konnte darauf leider keine Antwort generieren.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a clear, friendly fallback message
    return "Entschuldigung, ich habe gerade Verbindungsprobleme. Könntest du das bitte wiederholen?";
  }
};