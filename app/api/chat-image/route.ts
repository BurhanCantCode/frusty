import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { type Message } from '@/lib/constants';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('GROQ_API_KEY is not set in environment variables');
}

const groq = new Groq({
  apiKey: apiKey || ''
});

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string | {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }[];
};

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { role: 'assistant', content: 'API key not configured. Please set GROQ_API_KEY environment variable.' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await request.json();

    // Get the latest message which should contain the image
    const latestMessage = messages[messages.length - 1];
    
    if (!latestMessage?.content || !Array.isArray(latestMessage.content)) {
      throw new Error('Invalid message format');
    }

    const imageContent = latestMessage.content.find((item: { type: string }) => item.type === 'image_url');
    const textContent = latestMessage.content.find((item: { type: string }) => item.type === 'text');

    if (!imageContent?.image_url?.url) {
      throw new Error('No image provided');
    }

    // Clean the base64 image
    const base64Image = imageContent.image_url.url.replace(/^data:image\/\w+;base64,/, '');

    // Create analysis prompt without system message
    const analysisMessage: ChatMessage = {
      role: 'user',
      content: [
        { 
          type: 'text', 
          text: textContent?.text || 'Analyze this image and provide insights...' 
        },
        { 
          type: 'image_url', 
          image_url: { 
            url: `data:image/jpeg;base64,${base64Image}` 
          } 
        }
      ]
    };

    console.log('Sending analysis request...');

    const completion = await groq.chat.completions.create({
      messages: [analysisMessage] as any, // Type assertion to bypass strict typing
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.5,
      max_tokens: 8192,
      top_p: 1,
      stream: false,
    });

    if (!completion.choices[0]?.message) {
      throw new Error('No response from API');
    }

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error('Error in chat-image API:', error);
    return NextResponse.json(
      { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your image. Please try again.' 
      },
      { status: 500 }
    );
  }
} 