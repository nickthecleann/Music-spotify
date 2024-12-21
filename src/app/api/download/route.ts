// app/api/download/route.ts
import { downloadYouTubeAudio } from '../../../server/youtube';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Add additional URL validation
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        const result = await downloadYouTubeAudio(url);
        console.log('Download result:', result);

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process download' },
            { status: 500 }
        );
    }
}