import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { role, answers } = await req.json();
    
    // ИСПОЛЬЗУЕМ ГЛАВНУЮ МОДЕЛЬ 2026 ГОДА

const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      You are a Senior AI Implementation Consultant. 
      Role: ${role}. Answers: ${answers.join(', ')}.
      
      Provide 3 actionable AI strategy bullet points for the Canadian market. 
      Professional tone. ROI focused.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('API Error:', error);
    // Если 2.0 не сработала, попробуем вернуть конкретику
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}