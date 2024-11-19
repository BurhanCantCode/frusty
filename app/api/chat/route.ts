import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { type Message } from '@/lib/constants';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error('GROQ_API_KEY is not defined in environment variables');
}

const groq = new Groq({
  apiKey,
});

export async function POST(req: Request) {
  try {
    const { messages, modelId } = await req.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // Check for images
    const hasImages = messages.some((msg: Message) => 
      Array.isArray(msg.content) && 
      msg.content.some(c => c.type === 'image_url')
    );

    console.log('Sending request to Groq:', {
      model: modelId,
      messages
    });

    const completion = await groq.chat.completions.create({
      messages,
      model: modelId,
      temperature: 0.7,
      max_tokens: 1024,
    });

    if (!completion.choices?.[0]?.message) {
      throw new Error('No response from Groq API');
    }

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error('Error in chat route:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('unsupported protocol scheme')) {
        return NextResponse.json(
          { error: 'Invalid image URL format. Please ensure the image URL includes http:// or https://' },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 