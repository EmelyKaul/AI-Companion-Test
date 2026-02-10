import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from "../types";

// Removed top-level initialization to prevent crashes.

const SYSTEM_INSTRUCTION = `Du bist ein freundlicher, empathischer Begleiter für eine Forschungsstudie. 
Deine Aufgabe ist es, ein kurzes, unterstützendes Gespräch zu führen. 
Halte deine Antworten eher kurz und gesprächig (max 2-3 Sätze). 
Du bist kein Therapeut, sondern ein neutraler Zuhörer.
Sprich Deutsch.`;

// Helper function to safely retrieve the API key from various environment configurations
const getApiKey = (): string => {
  // 1. Check for Vite environment (Standard for modern React apps on Vercel)
  try {
    // @ts-ignore - import.meta might not be typed in all setups
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore errors if import.meta is not supported
  }

  // 2. Check for Process environment (Create React App, Next.js, or Webpack)
  try {
    if (typeof process !== "undefined" && process.env) {
      // Priority: Specific Frontend Prefixes
      if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
      if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
      
      // Fallback: Plain API_KEY (Only works if explicitly exposed by bundler config)
      if (process.env.API_KEY) return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore errors if process is not defined
  }

  return "";
};

export const getAIResponse = async (history: Message[], newMessage: string): Promise<string> => {
  try {
    // 1. Retrieve API Key
    const apiKey = getApiKey();

    // 2. Fallback if no key is found (Demo Mode)
    if (!apiKey) {
      console.log("No API Key found in VITE_API_KEY, REACT_APP_API_KEY, or API_KEY.");
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "Dies ist eine Demo-Antwort. API-Key fehlt. Bitte benenne die Variable in Vercel in 'VITE_API_KEY' (für Vite) oder 'REACT_APP_API_KEY' (für CRA) um, damit der Browser Zugriff darauf hat.";
    }

    // 3. Initialize AI
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