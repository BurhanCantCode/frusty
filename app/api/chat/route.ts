import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
});

export async function POST(request: Request) {
  try {
    const { messages, model } = await request.json();

    const formattedMessages = [
      {
        role: 'system',
        content: 'You are a helpful assistant. When analyzing questions or problems, break them down step by step and provide clear explanations. For mathematical problems, show your work and explain each step of the solution process.'
      },
      ...messages.map((message: any) => ({
        role: message.role,
        content: typeof message.content === 'string' ? message.content : message.content.text || message.content
      }))
    ];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model,
      temperature: 0.7,
      max_tokens: 8192,
      top_p: 1,
      stream: false,
    });

    if (!completion.choices[0]?.message) {
      throw new Error('No response from API');
    }

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { role: 'assistant', content: 'Sorry, there was an error processing your request.' },
      { status: 500 }
    );
  }
} 