import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public directory
    const path = join(process.cwd(), 'public/uploads');
    const fileName = `${Date.now()}-${file.name}`;
    await writeFile(`${path}/${fileName}`, buffer);

    // Get the host from headers
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    // Return the full URL
    return NextResponse.json({ 
      url: `${protocol}://${host}/uploads/${fileName}` 
    });
  } catch (error) {
    console.error('Error in upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 