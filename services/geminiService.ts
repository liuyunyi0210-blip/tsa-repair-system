
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Urgency } from "../types";

// 獲取 API Key，支援多種方式
const getApiKey = (): string => {
  // 優先從 process.env 讀取（構建時注入）
  if (process.env.API_KEY) return process.env.API_KEY;
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  // 從 import.meta.env 讀取（Vite 環境變數）
  if (import.meta.env?.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
  return '';
};

// 錯誤類型判斷
const getErrorType = (error: any): 'quota' | 'config' | 'network' | 'unknown' => {
  if (!error) return 'unknown';
  
  const errorMessage = error.message?.toLowerCase() || error.toString().toLowerCase();
  
  // 配額錯誤
  if (errorMessage.includes('quota') || 
      errorMessage.includes('rate limit') ||
      errorMessage.includes('429')) {
    return 'quota';
  }
  
  // 配置錯誤（API Key 問題）
  if (errorMessage.includes('api key') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('401') ||
      errorMessage.includes('403')) {
    return 'config';
  }
  
  // 網絡錯誤
  if (errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('load failed') ||
      errorMessage.includes('timeout')) {
    return 'network';
  }
  
  return 'unknown';
};

export const analyzeRepairRequest = async (description: string, category: Category) => {
  const apiKey = getApiKey();
  
  // 檢查 API Key 是否存在
  if (!apiKey) {
    console.error('❌ Gemini API Key is not configured');
    console.error('Please set GEMINI_API_KEY in environment variables or GitHub Secrets');
    return {
      error: 'API_KEY_MISSING',
      message: 'Gemini API Key 未設置，請檢查環境變數配置'
    };
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
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
  } catch (error: any) {
    const errorType = getErrorType(error);
    
    // 根據錯誤類型提供詳細訊息
    switch (errorType) {
      case 'quota':
        console.error('❌ Gemini API Quota Exceeded:', error);
        return {
          error: 'QUOTA_EXCEEDED',
          message: 'API 配額已用盡，請稍後再試或檢查您的 API 配額設定'
        };
      
      case 'config':
        console.error('❌ Gemini API Configuration Error:', error);
        console.error('Please check your GEMINI_API_KEY in GitHub Secrets or environment variables');
        return {
          error: 'API_KEY_INVALID',
          message: 'API Key 配置錯誤，請檢查環境變數設定'
        };
      
      case 'network':
        console.error('❌ Network Error:', error);
        return {
          error: 'NETWORK_ERROR',
          message: '網絡連接失敗，請檢查網絡連接後重試'
        };
      
      default:
        console.error('❌ Gemini Analysis Error:', error);
        return {
          error: 'UNKNOWN_ERROR',
          message: `分析失敗：${error.message || '未知錯誤'}`
        };
    }
  }
};
