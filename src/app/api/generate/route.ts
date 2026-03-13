import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initializing the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { role, detailedAnswers, businessInfo } = await req.json();
    
    // Using Gemini 3 Flash for high-speed, high-quality reasoning
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Formatting Question-Answer pairs for better AI context
    const contextString = detailedAnswers
      .map((item: any) => `Question: ${item.question}\nAnswer: ${item.answer}`)
      .join('\n\n');

    const prompt = `
      ROLE: You are a Senior AI Strategy Consultant. 
      CLIENT CONTEXT: ${businessInfo.companyName}, ${businessInfo.companySize} employees. 
      TARGET MARKET: ${businessInfo.market}.
      USER ROLE: ${role}. 
      
      ASSESSMENT DATA:
      ${contextString}

      TASK: Provide a 4-step AI transformation roadmap in under 160 words.
      FORMAT:
      1. **Quick Win:** [Immediate automation or tool recommendation based on their answers]
      2. **Strategic Move:** [Long-term AI integration strategy for their specific role]
      3. **Local Insight:** [Actionable advice regarding ${businessInfo.market} market trends or regulations]
      4. **Expert Guidance:** [Specifically describe how Inna Kashtanova, as an AI Implementation Lead, can help this company navigate these steps in the ${businessInfo.market} market]

      TONE: Professional, ROI-focused, and direct. Use the provided ASSESSMENT DATA to avoid generic advice.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    // Return a professional error message for the UI
    return NextResponse.json(
      { error: "The AI engine is currently under high demand. Please retry in 30 seconds." }, 
      { status: 500 }
    );
  }
}