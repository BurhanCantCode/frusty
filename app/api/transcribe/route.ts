import { NextRequest, NextResponse } from 'next/server';

async function waitForModel(retries = 3, delay = 5000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distil-whisper/distil-small.en",
      {
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: "" }), // Empty input to check model status
      }
    );

    if (response.ok) {
      return response;
    }

    const error = await response.json();
    if (error.error?.includes("currently loading")) {
      console.log(`Model loading, attempt ${i + 1}/${retries}. Waiting ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    throw new Error(`API error: ${error.error}`);
  }

  throw new Error("Model failed to load after retries");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as Blob;
    const modelId = formData.get('modelId') as string;

    if (!audio) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Create form data for Hugging Face API
    const apiFormData = new FormData();
    apiFormData.append('audio', audio, 'audio.wav');

    // Wait for model to be ready
    await waitForModel();

    // Use Hugging Face's Inference API with the correct model endpoint
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distil-whisper/distil-small.en",
      {
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        method: "POST",
        body: apiFormData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Transcription response:', data);
    
    // Extract text from Hugging Face response
    const text = data.text || (Array.isArray(data) ? data[0]?.text : '') || '';

    return NextResponse.json({
      text,
      model: modelId
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 