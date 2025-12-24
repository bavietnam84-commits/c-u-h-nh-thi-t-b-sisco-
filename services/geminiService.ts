
import { GoogleGenAI, Type } from "@google/genai";
import { DeviceType, GeneratedConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCiscoConfig = async (
  deviceType: DeviceType,
  description: string
): Promise<GeneratedConfig> => {
  const model = 'gemini-3-pro-preview';
  
  const prompt = `Generate a standard Cisco configuration for a ${deviceType} based on this request: "${description}". 
  Provide professional CLI commands, a clear explanation of what the config does, and a list of security best practices related to this config.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cliCommands: { type: Type.STRING, description: "The raw Cisco IOS/ASA/FTD CLI commands." },
          explanation: { type: Type.STRING, description: "Detailed explanation of the configuration." },
          bestPractices: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Security and performance best practices."
          }
        },
        required: ["cliCommands", "explanation", "bestPractices"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as GeneratedConfig;
};
