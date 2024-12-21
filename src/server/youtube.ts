import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

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

        // Download audio
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

            // Create write stream
            const writeStream = fs.createWriteStream(fullPath);

            writeStream.on('finish', () => {
                console.log('Download finished');
                resolve();
            });

            writeStream.on('error', (err) => {
                console.error('File write error:', err);
                reject(new Error(`File write error: ${err.message}`));
            });

            // Pipe the download to the file
            stream.pipe(writeStream);

            // Optional: Add progress tracking
            let downloadedBytes = 0;
            stream.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                console.log(`Downloaded: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`);
            });
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