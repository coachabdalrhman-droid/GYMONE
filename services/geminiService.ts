
import { GoogleGenAI, Type } from "@google/genai";
import { Member, Plan } from "../types";

export const getGymInsights = async (members: Member[], plans: Plan[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dataSummary = `
    Plans: ${plans.map(p => `${p.name} (${p.price} ILS)`).join(', ')}
    Members count: ${members.length}
    Active members: ${members.filter(m => m.status === 'نشط').length}
    Expiring soon: ${members.filter(m => m.status === 'قريب الانتهاء').length}
    Expired: ${members.filter(m => m.status === 'منتهي').length}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بصفتك مستشار إدارة نوادي رياضية محترف لجيم "الجلاء الرياضي" في غزة، قم بتحليل البيانات التالية وقدم 3 نصائح تسويقية أو إدارية مختصرة لزيادة الأرباح والاحتفاظ بالأعضاء باللغة العربية: ${dataSummary}`,
    });

    return response.text || "لا توجد رؤى متاحة حالياً.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، تعذر الاتصال بمساعد الذكاء الاصطناعي حالياً.";
  }
};
