import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  // Fallback for demo purposes if env is missing, but strictly adhering to instructions to use process.env.API_KEY
  // In a real scenario, ensure API_KEY is set.
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) {
    console.warn("API Key is missing. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTaskDescription = async (title: string): Promise<string> => {
  try {
    const ai = getAiClient();
    if (!process.env.API_KEY) return "الرجاء ضبط مفتاح API لتوليد الوصف.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `أنت مساعد ذكي في منصة إدارة مهام خيرية.
      المهمة بعنوان: "${title}".
      قم بكتابة وصف تفصيلي ومهني لهذه المهمة في حدود 50 كلمة باللغة العربية.
      ركز على الخطوات العملية.`,
    });
    
    return response.text || "لم يتم توليد وصف.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "حدث خطأ أثناء توليد الوصف. يرجى المحاولة لاحقاً.";
  }
};
