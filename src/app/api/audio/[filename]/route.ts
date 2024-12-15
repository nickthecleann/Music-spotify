import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const filePath = path.join(process.cwd(), 'downloads', filename);
    
    const stream = createReadStream(filePath);
    
    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Audio streaming error:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}