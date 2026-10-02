import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  checkRateLimit,
  extractFacebookVideo,
  isAllowedCdnUrl,
  resolveAndValidateMediaStream
} from './src/server/extractor.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security & Parsing middlewares
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// Helper to retrieve client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'facebook-video-downloader' });
});

// Video extraction handler
async function handleFacebookVideoExtraction(req: Request, res: Response): Promise<void> {
  const clientIp = getClientIp(req);

  // Rate Limiting: Max 5 requests per IP per minute
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment and try again.'
    });
    return;
  }

  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Please enter a valid public Facebook video URL.'
    });
    return;
  }

  try {
    const result = await extractFacebookVideo(url);
    if (!result.success) {
      res.status(result.status || 400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({
      success: false,
      error: "We couldn't process this video right now. Please try again later."
    });
  }
}

app.post('/api/facebook-video', handleFacebookVideoExtraction);
app.post('/.netlify/functions/facebook-video', handleFacebookVideoExtraction);

// Video streaming download handler
async function handleVideoDownload(req: Request, res: Response): Promise<void> {
  const videoUrl = ((req.query.url as string) || (req.body?.url as string) || '').trim();
  const rawFilename = (req.query.filename as string) || (req.body?.filename as string) || 'facebook-video.mp4';
  const quality = (req.query.quality as string) || (req.body?.quality as string);

  if (!videoUrl) {
    res.status(400).json({ success: false, error: 'Please enter a valid video URL to download.' });
    return;
  }

  // Validate URL, enforce Facebook authorized domains, SSRF protection and privacy restrictions
  const resolved = await resolveAndValidateMediaStream(videoUrl, quality);
  if (!resolved.valid || !resolved.streamUrl) {
    res.status(resolved.status || 400).json({
      success: false,
      error: resolved.error || 'This video appears to be private or unavailable.'
    });
    return;
  }

  let chosenFilename = rawFilename;
  if (!chosenFilename || chosenFilename === 'facebook-video.mp4') {
    chosenFilename = quality ? `facebook-video-${quality}.mp4` : 'facebook-video.mp4';
  }

  let safeFilename = chosenFilename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
  if (!safeFilename.toLowerCase().endsWith('.mp4')) {
    safeFilename += '.mp4';
  }

  try {
    const upstreamRes = await fetch(resolved.streamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      if (upstreamRes.status === 403 || upstreamRes.status === 404) {
        res.status(403).json({
          success: false,
          error: 'This video appears to be private or unavailable.'
        });
        return;
      }
      res.status(502).json({
        success: false,
        error: 'Unable to retrieve stream source.'
      });
      return;
    }

    res.status(upstreamRes.status === 206 ? 206 : 200);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'private, no-transform');
    res.setHeader('Accept-Ranges', 'bytes');

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Stream directly into Express response using chunk pump without buffering entire video
    const reader = upstreamRes.body.getReader();
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          const canContinue = res.write(value);
          if (!canContinue) {
            await new Promise(resolve => res.once('drain', resolve));
          }
        }
      } catch (streamErr) {
        console.error('Error during response streaming:', streamErr);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'Streaming error occurred.' });
        } else {
          res.end();
        }
      }
    };

    await pump();
  } catch (err) {
    console.error('Proxy download stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Failed to process media stream. Please try again later.' });
    }
  }
}

// Mount download handler on all standard endpoint paths
app.get('/api/download-video', handleVideoDownload);
app.post('/api/download-video', handleVideoDownload);
app.get('/api/download', handleVideoDownload);
app.get('/.netlify/functions/download-video', handleVideoDownload);
app.post('/.netlify/functions/download-video', handleVideoDownload);

// Mount Vite or serve production bundle
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Facebook Video Downloader server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
