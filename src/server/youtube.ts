'use server'

import ytdl from '@distube/ytdl-core'
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import toast from 'react-hot-toast';

interface DownloadOptions {
    outputPath?: string;
    filename?: string;
    quality?: 'highest' | 'lowest';
}

interface DownloadResult {
    success: boolean;
    message: string;
    filename?: string;
}

export async function downloadYouTubeAudio(
    url: string, 
    options: DownloadOptions = {}
): Promise<DownloadResult> {
    try {
        // Validate URL
        if (!ytdl.validateURL(url)) {
            
            return { success: false, message: 'Invalid YouTube URL' };
        } 


        // Get video info
        const info = await ytdl.getInfo(url);

        // Set default options
        const outputPath = options.outputPath || './downloads';
        const filename = options.filename || `${info.videoDetails.title}.mp3`;
        const quality = options.quality || 'highest';

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        // Clean filename by removing invalid characters
        const sanitizedFilename = filename.replace(/[/\\?%*:|"<>]/g, '-');
        const fullPath = path.join(outputPath, sanitizedFilename);

        // Download and convert to audio using ffmpeg
        await new Promise<void>((resolve, reject) => {
            const stream = ytdl(url, {
                quality: 'highestaudio',
                filter: 'audioonly',
                requestOptions: {
                    headers: {
                        'Cookie': process.env.YOUTUBE_COOKIE || '',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                }
            });

            ffmpeg(stream)
                .audioBitrate(128)
                .toFormat('mp3')
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .save(fullPath);
        });

        return {
            success: true,
            message: `Successfully downloaded: ${sanitizedFilename}`,
            filename: sanitizedFilename
        };

    } catch (error) {
        return {
            success: false,
            message: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}