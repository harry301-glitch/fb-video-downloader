/**
 * Facebook Video Extraction Utility
 * Handles URL validation, SSRF defense, rate limiting, and public stream resolution.
 */

// Hostnames allowed for Facebook video URLs
const ALLOWED_FB_HOSTNAMES = new Set([
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'web.facebook.com',
  'touch.facebook.com',
  'mbasic.facebook.com',
  'fb.watch',
  'www.fb.watch',
  'fb.com',
  'www.fb.com'
]);

// Allowed CDN domains for extracted streams & proxy download
const ALLOWED_CDN_HOSTS = [
  '.fbcdn.net',
  '.facebook.com',
  '.fbsbx.com'
];

export interface ResolutionTier {
  id: '360p' | '450p' | '480p' | '720p' | '1080p' | '1440p' | '2160p';
  height: number;
  label: string; // 'Small', 'Standard', 'HD', 'Full HD', '2K', '4K'
  displayQuality: string; // '360p Small', '450p Standard', '720p HD', etc.
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  videoCodec: string; // 'H.264'
  audioCodec: string; // 'AAC'
}

export const RESOLUTION_TIERS: Record<string, ResolutionTier> = {
  '360p': {
    id: '360p',
    height: 360,
    label: 'Small',
    displayQuality: '360p Small',
    videoBitrateKbps: 600,
    audioBitrateKbps: 96,
    videoCodec: 'H.264',
    audioCodec: 'AAC'
  },
  '450p': {
    id: '450p',
    height: 450,
    label: 'Standard',
    displayQuality: '450p Standard',
    videoBitrateKbps: 950,
    audioBitrateKbps: 128,
    videoCodec: 'H.264',
    audioCodec: 'AAC'
  },
  '480p': {
    id: '480p',
    height: 480,
    label: 'Standard',
    displayQuality: '480p Standard',
    videoBitrateKbps: 1250,
    audioBitrateKbps: 128,
    videoCodec: 'H.264',
    audioCodec: 'AAC'
  },
  '720p': {
    id: '720p',
    height: 720,
    label: 'HD',
    displayQuality: '720p HD',
    videoBitrateKbps: 3600,
    audioBitrateKbps: 160,
    videoCodec: 'H.264',
    audioCodec: 'AAC'
  },
  '1080p': {
    id: '1080p',
    height: 1080,
    label: 'Full HD',
    displayQuality: '1080p Full HD',
    videoBitrateKbps: 7500,
    audioBitrateKbps: 192,
    videoCodec: 'H.264',
    audioCodec: 'AAC'
  },
  '1440p': {
    id: '1440p',
    height: 1440,
    label: '2K',
    displayQuality: '1440p 2K',
    videoBitrateKbps: 11000,
    audioBitrateKbps: 256,
    videoCodec: 'H.264',
    audioCodec: 'AAC'
  },
  '2160p': {
    id: '2160p',
    height: 2160,
    label: '4K',
    displayQuality: '2160p 4K',
    videoBitrateKbps: 22000,
    audioBitrateKbps: 320,
    videoCodec: 'H.264',
    audioCodec: 'AAC'
  }
};

export interface VideoFormat {
  id: string; // '360p' | '450p' | '480p' | '720p' | '1080p' | '1440p' | '2160p'
  resolution: string; // '360p', '720p', '1080p', etc.
  quality: string; // '720p HD', '1080p Full HD', etc.
  label: string; // 'HD', 'Full HD', 'Standard', 'Small', '2K', '4K'
  height: number;
  format: 'MP4';
  url: string;
  size: string; // e.g. '~3.8 MB' or '3.8 MB'
  videoCodec: string; // 'H.264'
  audioCodec: string; // 'AAC'
  hasAudio: boolean; // true
  durationFormatted: string; // '00:08'
  durationSec: number;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
}

export interface ExtractorSuccess {
  success: true;
  title: string;
  thumbnail: string;
  duration?: string;
  durationSec?: number;
  formats: VideoFormat[];
}

export interface ExtractorError {
  success: false;
  error: string;
  status: number;
}

export type ExtractorResult = ExtractorSuccess | ExtractorError;

// In-memory IP rate limiter: 5 requests per IP per minute (60s sliding window)
interface RateRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref?.();

export function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(clientIp);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(clientIp, record);
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  record.timestamps.push(now);
  return true;
}

/**
 * Validates whether the given URL is a legitimate public Facebook URL
 * with SSRF protection.
 */
export function validateFacebookUrl(rawUrl: string): { valid: boolean; error?: string; parsedUrl?: URL } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Please enter a valid public Facebook video URL.' };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
  } catch {
    return { valid: false, error: 'Please enter a valid public Facebook video URL.' };
  }

  // Enforce HTTPS
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { valid: false, error: 'Please enter a valid public Facebook video URL.' };
  }

  // SSRF Protection: Reject user credentials or non-standard ports
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'Invalid URL format.' };
  }
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    return { valid: false, error: 'Invalid URL port.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // SSRF Protection: Reject private/loopback IP addresses
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('172.') ||
    hostname.startsWith('169.254.')
  ) {
    return { valid: false, error: 'Invalid host.' };
  }

  // Check against Facebook hostname allowlist
  const isAllowedHost = Array.from(ALLOWED_FB_HOSTNAMES).some(
    allowed => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );

  if (!isAllowedHost) {
    return { valid: false, error: 'This Facebook URL is not currently supported.' };
  }

  // Path validation for video patterns
  const path = parsed.pathname.toLowerCase();
  const search = parsed.search.toLowerCase();

  const isVideoPattern =
    hostname.includes('fb.watch') ||
    path.includes('/watch') ||
    path.includes('/videos/') ||
    path.includes('/video.php') ||
    path.includes('/reel/') ||
    path.includes('/reels/') ||
    path.includes('/share/v/') ||
    path.includes('/share/r/') ||
    search.includes('v=');

  if (!isVideoPattern && path === '/') {
    return { valid: false, error: 'Please enter a direct public Facebook video or reel URL.' };
  }

  return { valid: true, parsedUrl: parsed };
}

/**
 * Validates that a video stream URL belongs to authorized Facebook CDNs
 * with full SSRF and protocol protection.
 */
export function isAllowedCdnUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr.trim());

    // Protocol enforcement
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    // SSRF: reject credentials or non-standard ports
    if (parsed.username || parsed.password) {
      return false;
    }
    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // SSRF: reject loopbacks and private networks
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.') ||
      host.startsWith('169.254.')
    ) {
      return false;
    }

    return ALLOWED_CDN_HOSTS.some(allowed => host.endsWith(allowed) || host === allowed.slice(1));
  } catch {
    return false;
  }
}

/**
 * Calculates dynamic file size estimate based on duration, resolution tier bitrates, and codecs
 */
export function calculateEstimatedSize(
  durationSec: number,
  tier: ResolutionTier,
  actualProbedBytes?: number
): string {
  if (actualProbedBytes && actualProbedBytes > 1024) {
    if (actualProbedBytes >= 1024 * 1024 * 1024) {
      return `${(actualProbedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${(actualProbedBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const effectiveDuration = durationSec > 0 ? durationSec : 8;
  const totalBitrateKbps = tier.videoBitrateKbps + tier.audioBitrateKbps;
  const bytes = ((totalBitrateKbps * 1000) / 8) * effectiveDuration * 1.02;

  if (bytes >= 1024 * 1024 * 1024) {
    return `~${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Extracts accurate video duration from Facebook page metadata
 */
export function extractVideoDuration(html: string): { durationFormatted: string; durationSec: number } {
  let sec = 0;

  // 1. duration_in_ms or playable_duration_in_ms
  const msMatch = html.match(/["'](?:playable_duration_in_ms|duration_in_ms)["']\s*:\s*(\d+)/i);
  if (msMatch && msMatch[1]) {
    sec = Math.round(parseInt(msMatch[1], 10) / 1000);
  }

  // 2. meta video:duration
  if (!sec) {
    const metaMatch = html.match(/<meta[^>]+(?:property|name)=["']video:duration["'][^>]+content=["'](\d+)["']/i) ||
      html.match(/<meta[^>]+content=["'](\d+)["'][^>]+(?:property|name)=["']video:duration["']/i);
    if (metaMatch && metaMatch[1]) {
      sec = parseInt(metaMatch[1], 10);
    }
  }

  // 3. "duration": 8
  if (!sec) {
    const durationMatch = html.match(/["']duration["']\s*:\s*["']?(\d+)["']?/i);
    if (durationMatch && durationMatch[1]) {
      sec = parseInt(durationMatch[1], 10);
    }
  }

  // 4. ISO 8601 duration e.g. PT8S or PT1M15S
  if (!sec) {
    const isoMatch = html.match(/["']duration["']\s*:\s*["']PT(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?["']/i);
    if (isoMatch) {
      const mins = parseInt(isoMatch[1] || '0', 10);
      const secs = Math.round(parseFloat(isoMatch[2] || '0'));
      sec = mins * 60 + secs;
    }
  }

  if (!sec || isNaN(sec) || sec <= 0) {
    sec = 8; // fallback realistic sample
  }

  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const formatted = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  return { durationFormatted: formatted, durationSec: sec };
}

/**
 * Resolves and validates a video URL (whether direct public CDN or Facebook video post)
 * to an authorized streamable MP4 URL.
 */
export async function resolveAndValidateMediaStream(
  requestedUrl: string,
  preferredQuality?: string
): Promise<{
  valid: boolean;
  streamUrl?: string;
  error?: string;
  status?: number;
}> {
  if (!requestedUrl || typeof requestedUrl !== 'string') {
    return { valid: false, error: 'Please provide a valid video URL.', status: 400 };
  }

  const trimmed = requestedUrl.trim();

  // Case 1: Already a validated authorized direct CDN stream
  if (isAllowedCdnUrl(trimmed)) {
    return { valid: true, streamUrl: trimmed };
  }

  // Case 2: Facebook post/reel/watch URL - extract and resolve public stream
  const fbValidation = validateFacebookUrl(trimmed);
  if (fbValidation.valid) {
    const extraction = await extractFacebookVideo(trimmed);
    if (!extraction.success) {
      return {
        valid: false,
        error: extraction.error || 'This video appears to be private or unavailable.',
        status: extraction.status || 404
      };
    }

    if (!extraction.formats || extraction.formats.length === 0) {
      return {
        valid: false,
        error: 'This video appears to be private or unavailable.',
        status: 404
      };
    }

    const cleanPref = (preferredQuality || '').toLowerCase().trim();

    // Match requested quality exactly or pick nearest available resolution
    const targetFormat =
      extraction.formats.find(f => cleanPref && (
        f.id.toLowerCase() === cleanPref ||
        f.resolution.toLowerCase() === cleanPref ||
        f.quality.toLowerCase().includes(cleanPref) ||
        f.label.toLowerCase() === cleanPref
      )) ||
      extraction.formats.find(f => f.resolution.includes('1080')) ||
      extraction.formats.find(f => f.resolution.includes('720')) ||
      extraction.formats[0];

    if (!targetFormat || !isAllowedCdnUrl(targetFormat.url)) {
      return {
        valid: false,
        error: 'No downloadable public stream found for this video.',
        status: 404
      };
    }

    return { valid: true, streamUrl: targetFormat.url };
  }

  return {
    valid: false,
    error: 'Invalid or unauthorized video URL.',
    status: 400
  };
}

/**
 * Maps a stream URL to its genuine ResolutionTier without upscaling or false labeling
 */
function resolveStreamTier(url: string, html: string, defaultBase?: 'HD' | 'SD'): ResolutionTier | null {
  try {
    const parsed = new URL(url);
    const efg = parsed.searchParams.get('efg');
    if (efg) {
      const decoded = Buffer.from(efg, 'base64').toString('utf-8');
      if (decoded.includes('2160p') || decoded.includes('2160')) return RESOLUTION_TIERS['2160p'];
      if (decoded.includes('1440p') || decoded.includes('1440')) return RESOLUTION_TIERS['1440p'];
      if (decoded.includes('1080p') || decoded.includes('1080')) return RESOLUTION_TIERS['1080p'];
      if (decoded.includes('720p') || decoded.includes('720')) return RESOLUTION_TIERS['720p'];
      if (decoded.includes('480p') || decoded.includes('480')) return RESOLUTION_TIERS['480p'];
      if (decoded.includes('450p') || decoded.includes('450')) return RESOLUTION_TIERS['450p'];
      if (decoded.includes('360p') || decoded.includes('360')) return RESOLUTION_TIERS['360p'];
    }
  } catch {
    // Continue
  }

  // URL pathname / query checks
  if (url.includes('2160p') || url.includes('_2160_')) return RESOLUTION_TIERS['2160p'];
  if (url.includes('1440p') || url.includes('_1440_')) return RESOLUTION_TIERS['1440p'];
  if (url.includes('1080p') || url.includes('_1080_')) return RESOLUTION_TIERS['1080p'];
  if (url.includes('720p') || url.includes('_720_')) return RESOLUTION_TIERS['720p'];
  if (url.includes('480p') || url.includes('_480_')) return RESOLUTION_TIERS['480p'];
  if (url.includes('450p') || url.includes('_450_')) return RESOLUTION_TIERS['450p'];
  if (url.includes('360p') || url.includes('_360_')) return RESOLUTION_TIERS['360p'];

  if (defaultBase === 'HD') {
    const heightMatch = html.match(/(?:original_height|target_height|video_height)["':\s]+(\d+)/i);
    if (heightMatch && heightMatch[1]) {
      const h = parseInt(heightMatch[1], 10);
      if (h >= 2160) return RESOLUTION_TIERS['2160p'];
      if (h >= 1440) return RESOLUTION_TIERS['1440p'];
      if (h >= 1080) return RESOLUTION_TIERS['1080p'];
      if (h >= 720) return RESOLUTION_TIERS['720p'];
      if (h >= 480) return RESOLUTION_TIERS['480p'];
    }
    return RESOLUTION_TIERS['720p'];
  }

  if (defaultBase === 'SD') {
    const heightMatch = html.match(/(?:original_height|target_height|video_height)["':\s]+(\d+)/i);
    if (heightMatch && heightMatch[1]) {
      const h = parseInt(heightMatch[1], 10);
      if (h === 480) return RESOLUTION_TIERS['480p'];
      if (h === 450) return RESOLUTION_TIERS['450p'];
      if (h <= 360) return RESOLUTION_TIERS['360p'];
    }
    return RESOLUTION_TIERS['360p'];
  }

  return null;
}

/**
 * Fast probe for actual bytes via Range/Content-Length check
 */
async function getProbedBytes(url: string): Promise<number | undefined> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Range': 'bytes=0-0'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const range = res.headers.get('content-range');
    if (range) {
      const match = range.match(/\/(\d+)$/);
      if (match) {
        const bytes = parseInt(match[1], 10);
        if (!isNaN(bytes) && bytes > 1024) return bytes;
      }
    }

    const len = res.headers.get('content-length');
    if (len) {
      const bytes = parseInt(len, 10);
      if (!isNaN(bytes) && bytes > 1024) return bytes;
    }
  } catch {
    // Fail silently on probe
  }
  return undefined;
}

/**
 * Clean & unescape Facebook raw string URLs
 */
function cleanUrl(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\\u0026/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/\\\//g, '/')
    .replace(/\\/g, '')
    .trim();
}

/**
 * Extracts video title, thumbnail, and public media formats.
 * Only works on publicly accessible, non-restricted videos.
 */
export async function extractFacebookVideo(targetUrl: string): Promise<ExtractorResult> {
  const validation = validateFacebookUrl(targetUrl);
  if (!validation.valid || !validation.parsedUrl) {
    return {
      success: false,
      error: validation.error || 'Please enter a valid public Facebook video URL.',
      status: 400
    };
  }

  // Normalize URL to desktop/mobile standard URL
  let fetchUrl = validation.parsedUrl.href;
  if (validation.parsedUrl.protocol === 'http:') {
    fetchUrl = fetchUrl.replace('http://', 'https://');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(fetchUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok && response.status !== 302 && response.status !== 301) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'This video appears to be private or unavailable.',
          status: 404
        };
      }
      return {
        success: false,
        error: "We couldn't process this video right now. Please try again later.",
        status: 502
      };
    }

    const html = await response.text();

    // Check for explicit Facebook privacy/login walls
    const isLoginWall =
      html.includes('id="login_form"') ||
      html.includes('You must log in to continue') ||
      html.includes('Log In to Facebook') ||
      html.includes('Log into Facebook') ||
      html.includes('This content isn\'t available right now') ||
      html.includes('When this happens, it\'s usually because the owner only shared it with a small group of people') ||
      html.includes('This page isn\'t available') ||
      html.includes('login_popup_cta_element');

    // Extract Title
    let title = 'Facebook Public Video';
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:title["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .trim();
    } else {
      const pageTitleMatch = html.match(/<title>(.*?)<\/title>/i);
      if (pageTitleMatch && pageTitleMatch[1]) {
        title = pageTitleMatch[1].replace(/ \| Facebook/i, '').replace(/ - Facebook/i, '').trim();
      }
    }

    // Extract Thumbnail
    let thumbnail = '';
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:image["']/i) ||
      html.match(/<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i);
    if (ogImageMatch && ogImageMatch[1]) {
      thumbnail = cleanUrl(ogImageMatch[1]);
    }

    // Extract direct playable MP4 streams
    let hdUrl = '';
    let sdUrl = '';

    // Pattern 1: browser_native_hd_url / browser_native_sd_url
    const hdMatch1 = html.match(/["']browser_native_hd_url["']\s*:\s*["']([^"']+)["']/i);
    if (hdMatch1 && hdMatch1[1]) hdUrl = cleanUrl(hdMatch1[1]);

    const sdMatch1 = html.match(/["']browser_native_sd_url["']\s*:\s*["']([^"']+)["']/i);
    if (sdMatch1 && sdMatch1[1]) sdUrl = cleanUrl(sdMatch1[1]);

    // Pattern 2: playable_url_quality_hd / playable_url
    if (!hdUrl) {
      const hdMatch2 = html.match(/["']playable_url_quality_hd["']\s*:\s*["']([^"']+)["']/i);
      if (hdMatch2 && hdMatch2[1]) hdUrl = cleanUrl(hdMatch2[1]);
    }
    if (!sdUrl) {
      const sdMatch2 = html.match(/["']playable_url["']\s*:\s*["']([^"']+)["']/i);
      if (sdMatch2 && sdMatch2[1]) sdUrl = cleanUrl(sdMatch2[1]);
    }

    // Pattern 3: hd_src / sd_src
    if (!hdUrl) {
      const hdMatch3 = html.match(/["']hd_src["']\s*:\s*["']([^"']+)["']/i);
      if (hdMatch3 && hdMatch3[1]) hdUrl = cleanUrl(hdMatch3[1]);
    }
    if (!sdUrl) {
      const sdMatch3 = html.match(/["']sd_src["']\s*:\s*["']([^"']+)["']/i);
      if (sdMatch3 && sdMatch3[1]) sdUrl = cleanUrl(sdMatch3[1]);
    }

    // Pattern 4: og:video or secure_url
    if (!sdUrl && !hdUrl) {
      const ogVideoMatch = html.match(/<meta\s+property=["']og:video(?::secure_url)?["']\s+content=["']([^"']+)["']/i);
      if (ogVideoMatch && ogVideoMatch[1]) {
        const potentialUrl = cleanUrl(ogVideoMatch[1]);
        if (potentialUrl.includes('.mp4') || potentialUrl.includes('fbcdn.net')) {
          sdUrl = potentialUrl;
        }
      }
    }

    // Extract accurate duration
    const { durationFormatted, durationSec } = extractVideoDuration(html);

    // Collect all genuinely available progressive stream candidates
    const streamMap = new Map<string, { tier: ResolutionTier; url: string }>();

    // 1. Direct HD stream
    if (hdUrl && isAllowedCdnUrl(hdUrl)) {
      const tier = resolveStreamTier(hdUrl, html, 'HD') || RESOLUTION_TIERS['720p'];
      streamMap.set(tier.id, { tier, url: hdUrl });
    }

    // 2. Direct SD stream
    if (sdUrl && isAllowedCdnUrl(sdUrl)) {
      const tier = resolveStreamTier(sdUrl, html, 'SD') || RESOLUTION_TIERS['360p'];
      if (!streamMap.has(tier.id)) {
        streamMap.set(tier.id, { tier, url: sdUrl });
      }
    }

    // 3. Scan for other progressive mp4 streams on Facebook CDN in page scripts
    const fbCdnMatches = html.matchAll(/(?:https?:\\\/\\\/|https:\/\/)[a-zA-Z0-9.-]+\.fbcdn\.net[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=\\-]+?\.mp4[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=\\-]*?(?=["'\s<>])/gi);
    for (const match of fbCdnMatches) {
      const rawUrl = match[0];
      const cleaned = cleanUrl(rawUrl);
      if (isAllowedCdnUrl(cleaned)) {
        const tier = resolveStreamTier(cleaned, html);
        if (tier && !streamMap.has(tier.id)) {
          streamMap.set(tier.id, { tier, url: cleaned });
        }
      }
    }

    // If nothing found and login wall detected
    if (streamMap.size === 0) {
      if (isLoginWall) {
        return {
          success: false,
          error: 'This video appears to be private or unavailable.',
          status: 403
        };
      }

      return {
        success: false,
        error: 'This video appears to be private or unavailable.',
        status: 404
      };
    }

    // Convert to VideoFormat array, sorted by resolution height descending
    const sortedTiers = Array.from(streamMap.values()).sort((a, b) => b.tier.height - a.tier.height);

    const formats: VideoFormat[] = [];
    for (const item of sortedTiers) {
      formats.push({
        id: item.tier.id,
        resolution: item.tier.id,
        quality: item.tier.displayQuality,
        label: item.tier.label,
        height: item.tier.height,
        format: 'MP4',
        url: item.url,
        size: calculateEstimatedSize(durationSec, item.tier),
        videoCodec: item.tier.videoCodec,
        audioCodec: item.tier.audioCodec,
        hasAudio: true,
        durationFormatted,
        durationSec,
        videoBitrateKbps: item.tier.videoBitrateKbps,
        audioBitrateKbps: item.tier.audioBitrateKbps
      });
    }

    // Concurrently probe CDN for actual Content-Length/Range if available to refine size
    await Promise.all(
      formats.map(async fmt => {
        const tier = RESOLUTION_TIERS[fmt.id];
        if (tier) {
          const probedBytes = await getProbedBytes(fmt.url);
          if (probedBytes) {
            fmt.size = calculateEstimatedSize(durationSec, tier, probedBytes);
          }
        }
      })
    );

    return {
      success: true,
      title: title || 'Public Facebook Video',
      thumbnail: thumbnail || '',
      duration: durationFormatted,
      durationSec,
      formats
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        error: "We couldn't process this video right now. Request timed out.",
        status: 504
      };
    }
    return {
      success: false,
      error: "We couldn't process this video right now. Please try again later.",
      status: 500
    };
  }
}
