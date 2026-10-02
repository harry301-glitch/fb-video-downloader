import { resolveAndValidateMediaStream } from '../../src/server/extractor.ts';

/**
 * Netlify Function: /netlify/functions/download-video
 * Streams authorized public Facebook MP4 videos with Content-Disposition: attachment
 * without buffering the full file in memory.
 */
export default async (req: Request): Promise<Response> => {
  // Allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method Not Allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let requestedUrl = '';
  let requestedFilename = 'facebook-video.mp4';
  let requestedQuality = '';

  const parsedUrl = new URL(req.url);

  if (req.method === 'GET') {
    requestedUrl = parsedUrl.searchParams.get('url') || '';
    requestedFilename = parsedUrl.searchParams.get('filename') || 'facebook-video.mp4';
    requestedQuality = parsedUrl.searchParams.get('quality') || '';
  } else {
    // POST request
    try {
      const body = await req.json();
      requestedUrl = body.url || parsedUrl.searchParams.get('url') || '';
      requestedFilename = body.filename || parsedUrl.searchParams.get('filename') || 'facebook-video.mp4';
      requestedQuality = body.quality || parsedUrl.searchParams.get('quality') || '';
    } catch {
      requestedUrl = parsedUrl.searchParams.get('url') || '';
      requestedFilename = parsedUrl.searchParams.get('filename') || 'facebook-video.mp4';
      requestedQuality = parsedUrl.searchParams.get('quality') || '';
    }
  }

  if (!requestedUrl) {
    return new Response(
      JSON.stringify({ success: false, error: 'Please enter a valid video URL to download.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate URL, enforce Facebook authorized domains, SSRF protection and privacy restrictions
  const resolved = await resolveAndValidateMediaStream(requestedUrl, requestedQuality);
  if (!resolved.valid || !resolved.streamUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        error: resolved.error || 'This video appears to be private or unavailable.'
      }),
      {
        status: resolved.status || 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Format filename cleanly to include quality tag (e.g. facebook-video-720p.mp4)
  if (!requestedFilename || requestedFilename === 'facebook-video.mp4') {
    requestedFilename = requestedQuality ? `facebook-video-${requestedQuality}.mp4` : 'facebook-video.mp4';
  }

  // Sanitize filename to prevent header injection
  let safeFilename = requestedFilename
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
        return new Response(
          JSON.stringify({
            success: false,
            error: 'This video appears to be private or unavailable.'
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unable to stream video from authorized source.'
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const headers = new Headers();
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    headers.set('Cache-Control', 'private, no-transform');
    headers.set('Accept-Ranges', 'bytes');

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    // Stream directly to the client without buffering full video in memory
    return new Response(upstreamRes.body, {
      status: upstreamRes.status === 206 ? 206 : 200,
      headers
    });
  } catch (err) {
    console.error('Download stream error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process media stream. Please try again later.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
