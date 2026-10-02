import { extractFacebookVideo, checkRateLimit } from '../src/server/extractor.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment and try again.'
    });
  }

  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid public Facebook video URL.'
    });
  }

  const result = await extractFacebookVideo(url);
  return res.status(result.success ? 200 : (result.status || 400)).json(result);
}
