import { extractFacebookVideo, checkRateLimit } from '../../src/server/extractor.ts';

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
    };
  }

  const clientIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || '127.0.0.1';

  if (!checkRateLimit(clientIp)) {
    return {
      statusCode: 429,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      })
    };
  }

  let body: any = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Invalid JSON payload.'
      })
    };
  }

  const { url } = body;
  if (!url || typeof url !== 'string') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Please enter a valid public Facebook video URL.'
      })
    };
  }

  const result = await extractFacebookVideo(url);
  return {
    statusCode: result.success ? 200 : (result.status || 400),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  };
};

