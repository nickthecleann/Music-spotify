import { downloadYouTubeAudio } from '../../../server/youtube';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const result = await downloadYouTubeAudio(url);
        console.log('Download result:', result); // Add this to see what we're getting

        return NextResponse.json(result);
    } catch (error) {
        console.error('Download error:', error); // Add this for debugging
        return NextResponse.json(
            { error: 'Failed to process download' },
            { status: 500 }
        );
    }
}