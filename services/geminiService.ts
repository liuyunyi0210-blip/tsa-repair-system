
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Urgency } from "../types";

export const analyzeRepairRequest = async (description: string, category: Category) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析以下會館維修報修內容，並提供結構化建議。
      報修類別：${category}
      問題描述：${description}
      
      請回傳 JSON 格式，包含：
      1. suggestedUrgency: "LOW", "MEDIUM", "HIGH", "EMERGENCY" 之一
      2. potentialCauses: 可能的原因清單 (Array of strings)
      3. maintenanceTips: 給會館人員的緊急處置建議 (String)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedUrgency: { type: Type.STRING },
            potentialCauses: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            maintenanceTips: { type: Type.STRING }
          },
          required: ["suggestedUrgency", "potentialCauses", "maintenanceTips"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
