import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from "../types";

// Removed top-level initialization. 
// This prevents the app from crashing immediately if process.env is undefined or the key is missing.

const SYSTEM_INSTRUCTION = `Du bist ein freundlicher, empathischer Begleiter für eine Forschungsstudie. 
Deine Aufgabe ist es, ein kurzes, unterstützendes Gespräch zu führen. 
Halte deine Antworten eher kurz und gesprächig (max 2-3 Sätze). 
Du bist kein Therapeut, sondern ein neutraler Zuhörer.
Sprich Deutsch.`;

export const getAIResponse = async (history: Message[], newMessage: string): Promise<string> => {
  try {
    // 1. Safely retrieve API Key without crashing
    let apiKey = "";
    try {
      // Check if process exists before accessing it (prevents 'process is not defined' error in browsers)
      if (typeof process !== "undefined" && process.env) {
        apiKey = process.env.API_KEY || "";
      }
    } catch (e) {
      console.warn("Environment check failed, running in demo mode.");
    }

    // 2. Fallback if no key is found (Demo Mode)
    if (!apiKey) {
      console.log("No API Key found. Returning mock response.");
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "Dies ist eine Demo-Antwort. Die App läuft im 'Rohmodus', da kein API-Key gefunden wurde. Bitte füge 'API_KEY' in den Vercel-Umgebungsvariablen hinzu, um die echte AI zu aktivieren.";
    }

    // 3. Initialize AI only when actually needed
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Transform internal message history to Gemini format
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
    return "Entschuldigung, es gab ein Verbindungsproblem (API Fehler). Bitte versuche es später noch einmal.";
  }
};