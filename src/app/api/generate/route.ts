import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { role, answers, businessInfo } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      CONTEXT: Senior AI Consultant. 
      CLIENT: ${businessInfo.companyName}, ${businessInfo.companySize} employees, Market: ${businessInfo.market}.
      ROLE: ${role}. 
      ANSWERS: ${answers.join(', ')}.

      TASK: Provide a razor-sharp AI Strategy.
      CONSTRAINTS: 
      - Max 150 words.
      - Use ONLY this format:
        **BIGGEST IMPACT:** [1 sentence]
        **TOOL RECOMMENDATION:** [Name 1 tool + why]
        **IMMEDIATE FIRST STEP:** [Actionable step]
      - Tone: Professional, Canadian business standards. 
      - No intro "As a consultant...". Start directly.
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}