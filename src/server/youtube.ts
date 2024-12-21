import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';

// Explicitly set FFmpeg paths
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}
if (ffprobePath?.path) {
    ffmpeg.setFfprobePath(ffprobePath.path);
}

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
        // Validate FFmpeg installation
        if (!ffmpegPath) {
            throw new Error('FFmpeg path not found');
        }

        // Log FFmpeg path for debugging
        console.log('FFmpeg Path:', ffmpegPath);

        if (!ytdl.validateURL(url)) {
            return { success: false, message: 'Invalid YouTube URL' };
        }

        const videoId = ytdl.getVideoID(url);
        console.log('Video ID:', videoId);

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        };

        const info = await ytdl.getBasicInfo(url, {
            requestOptions: { headers }
        });

        const outputPath = options.outputPath || path.join(process.cwd(), 'public', 'audio');
        const timestamp = Date.now();
        const baseFilename = `${info.videoDetails.title.replace(/[^\w\s]/g, '').replace(/\s+/g, '-').toLowerCase()}-${timestamp}`;
        const filename = options.filename || `${baseFilename}.mp3`;
        const sanitizedFilename = filename.replace(/[/\\?%*:|"<>]/g, '-');
        const fullPath = path.join(outputPath, sanitizedFilename);

        // Ensure output directory exists
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        // Download and process
        await new Promise<void>((resolve, reject) => {
            const stream = ytdl(url, {
                quality: 'highestaudio',
                filter: 'audioonly',
                requestOptions: { headers },
                highWaterMark: 1 << 25
            });

            stream.on('error', (err) => {
                console.error('YouTube download error:', err);
                reject(new Error(`YouTube download error: ${err.message}`));
            });

            // Create FFmpeg command with explicit error handling
            const command = ffmpeg(stream)
                .toFormat('mp3')
                .audioBitrate('128k');

            // Add FFmpeg event handlers
            command
                .on('start', (commandLine) => {
                    console.log('FFmpeg command:', commandLine);
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`Processing: ${progress.percent.toFixed(2)}% done`);
                    }
                })
                .on('end', () => {
                    console.log('Processing finished');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('FFmpeg processing error:', err);
                    reject(new Error(`FFmpeg processing error: ${err.message}`));
                });

            // Save the file
            command.save(fullPath);
        });

        return {
            success: true,
            message: `Successfully downloaded: ${sanitizedFilename}`,
            filename: sanitizedFilename
        };

    } catch (error) {
        console.error('Download error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            message: `Download failed: ${errorMessage}`
        };
    }
}