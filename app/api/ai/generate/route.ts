import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    try {
        const { prompt, context } = await req.json();

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const systemPrompt = `You are an expert email writing assistant for sales professionals.
        
        CRITICAL RULES:
        - Output ONLY plain text email body
        - NO HTML tags, NO JSON, NO markdown formatting
        - NO subject lines, NO greetings like "Subject:" or "Dear [Name]"
        - Write naturally and professionally
        - Keep it concise and actionable
        - Use proper paragraphs (double line breaks between paragraphs)
        
        Context:
        Subject: ${context?.subject || 'N/A'}
        Recipient: ${context?.recipient || 'N/A'}
        
        User Request: ${prompt}
        
        Write the email body now (plain text only):`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error) {
        console.error('AI Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
}
