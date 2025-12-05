import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PRDResponse } from "../types";

// Define the exact schema we want Gemini to return
const prdSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    appName: { type: Type.STRING, description: "A catchy name for the SaaS" },
    tagline: { type: Type.STRING, description: "A short, punchy tagline" },
    summary: { type: Type.STRING, description: "A comprehensive project summary (2-3 sentences)" },
    targetUsers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of target user personas"
    },
    features: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          userStory: { type: Type.STRING, description: "As a [user], I want to [action] so that [benefit]" },
          acceptanceCriteria: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of specific criteria to mark feature as done"
          },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        },
        required: ["name", "userStory", "acceptanceCriteria", "priority"]
      }
    },
    techStack: {
      type: Type.OBJECT,
      properties: {
        frontend: { type: Type.STRING },
        backend: { type: Type.STRING },
        database: { type: Type.STRING },
        auth: { type: Type.STRING },
        deployment: { type: Type.STRING }
      },
      required: ["frontend", "backend", "database", "auth", "deployment"]
    },
    dataModels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Entity name (e.g., User, Subscription)" },
          description: { type: Type.STRING },
          attributes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of fields/attributes like 'id: uuid', 'email: string'"
          }
        },
        required: ["name", "description", "attributes"]
      }
    },
    userFlow: { type: Type.STRING, description: "A step-by-step text description of the main user journey." },
    mvpScope: {
      type: Type.OBJECT,
      properties: {
        mustHave: { type: Type.ARRAY, items: { type: Type.STRING } },
        shouldHave: { type: Type.ARRAY, items: { type: Type.STRING } },
        couldHave: { type: Type.ARRAY, items: { type: Type.STRING } },
        wontHave: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["mustHave", "shouldHave", "couldHave", "wontHave"]
    },
    cursorPrompt: {
      type: Type.STRING,
      description: "A highly detailed, single-file prompt designed to be pasted into Cursor IDE's Composer to build the MVP. It should include file structure, dependencies, and core logic instructions."
    },
    replitPrompt: {
      type: Type.STRING,
      description: "Step-by-step instructions for an Agent-based IDE like Replit or Lovable to build the app iteratively."
    }
  },
  required: [
    "appName", "tagline", "summary", "targetUsers", "features",
    "techStack", "dataModels", "userFlow", "mvpScope",
    "cursorPrompt", "replitPrompt"
  ]
};

export const generatePRD = async (rawIdea: string): Promise<PRDResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an elite Senior Product Manager and Software Architect.
    Your goal is to take a messy, unstructured app idea and transform it into a rigorous, professional Product Requirements Document (PRD) optimized for "Vibecoding" (using AI IDEs).

    STRICT RULES:
    1. Focus on modern, scalable tech stacks (React, TypeScript, Tailwind, Supabase/Firebase, Node.js/Next.js).
    2. The "cursorPrompt" must be EXTREMELY detailed. It should tell Cursor exactly which files to create, what libraries to use, and how to structure the project. It should be a "One-Shot" prompt attempt.
    3. The "replitPrompt" should be conversational and step-by-step for an Agent.
    4. Be realistic about MVP scope. Don't overengineer the "Must Haves".
    5. The Data Models should be relational and logical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `Here is the raw idea: ${rawIdea}` }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: prdSchema,
        temperature: 0.4, // Keep it relatively deterministic but creative enough for the prompts
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as PRDResponse;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};