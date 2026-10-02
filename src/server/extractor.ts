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

export interface VideoFormat {
  quality: string;
  resolution?: string;
  format: 'MP4';
  url: string;
  size?: string;
  hasAudio?: boolean;
}

export interface ExtractorSuccess {
  success: true;
  title: string;
  thumbnail: string;
  duration?: string;
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

    const targetFormat =
      extraction.formats.find(f => preferredQuality && (
        f.quality.toLowerCase().includes(preferredQuality.toLowerCase()) ||
        f.resolution?.toLowerCase() === preferredQuality.toLowerCase()
      )) ||
      extraction.formats.find(f => f.resolution?.includes('1080')) ||
      extraction.formats.find(f => f.resolution?.includes('720')) ||
      extraction.formats.find(f => f.quality.includes('HD') || f.resolution === 'HD') ||
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
 * Detects genuine video resolution without false labeling or upscaling
 */
function detectGenuineResolution(
  url: string,
  html: string,
  baseType: 'HD' | 'SD'
): { quality: string; resolution: string } {
  // 1. Inspect efg query parameter in Facebook CDN URL (base64 encoded JSON)
  try {
    const parsed = new URL(url);
    const efg = parsed.searchParams.get('efg');
    if (efg) {
      const decoded = Buffer.from(efg, 'base64').toString('utf-8');
      if (decoded.includes('1080p') || decoded.includes('1080')) {
        return { quality: '1080p Full HD', resolution: '1080p' };
      }
      if (decoded.includes('720p') || decoded.includes('720')) {
        return { quality: '720p HD', resolution: '720p' };
      }
      if (decoded.includes('480p') || decoded.includes('480')) {
        return { quality: '480p SD', resolution: '480p' };
      }
      if (decoded.includes('360p') || decoded.includes('360')) {
        return { quality: '360p SD', resolution: '360p' };
      }
    }
  } catch {
    // Continue if URL parsing fails
  }

  // 2. Direct string match in URL filename / query
  if (url.includes('1080p') || url.includes('_1080_')) {
    return { quality: '1080p Full HD', resolution: '1080p' };
  }
  if (url.includes('720p') || url.includes('_720_')) {
    return { quality: '720p HD', resolution: '720p' };
  }
  if (url.includes('480p')) {
    return { quality: '480p SD', resolution: '480p' };
  }
  if (url.includes('360p')) {
    return { quality: '360p SD', resolution: '360p' };
  }

  // 3. Inspect JSON metadata in page HTML for height dimensions
  if (baseType === 'HD') {
    const heightMatch = html.match(/(?:original_height|target_height|video_height)["':\s]+(\d+)/i);
    if (heightMatch && heightMatch[1]) {
      const h = parseInt(heightMatch[1], 10);
      if (h >= 1080) {
        return { quality: '1080p Full HD', resolution: '1080p' };
      }
      if (h >= 720) {
        return { quality: '720p HD', resolution: '720p' };
      }
    }
    // Genuinely verified HD stream without claiming 1080p falsely
    return { quality: 'Best / HD', resolution: 'HD' };
  }

  return { quality: 'SD (Standard)', resolution: 'SD' };
}

/**
 * Retrieves approximate file size from CDN headers or estimates from duration
 */
async function getApproximateFileSize(
  url: string,
  durationSec?: number,
  isHd?: boolean
): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
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
        if (!isNaN(bytes) && bytes > 0) {
          if (bytes >= 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
          }
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
      }
    }

    const len = res.headers.get('content-length');
    if (len) {
      const bytes = parseInt(len, 10);
      if (!isNaN(bytes) && bytes > 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    }
  } catch {
    // Fail silently on network probing
  }

  if (durationSec && durationSec > 0) {
    const estimatedBytes = isHd ? durationSec * 220 * 1024 : durationSec * 90 * 1024;
    return `~${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
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

    // Extract approximate duration if available
    let durationSec: number | undefined = undefined;
    let duration: string | undefined = undefined;
    const durationMatch = html.match(/["']duration["']\s*:\s*["']?(\d+)["']?/i);
    if (durationMatch && durationMatch[1]) {
      const sec = parseInt(durationMatch[1], 10);
      if (!isNaN(sec) && sec > 0) {
        durationSec = sec;
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        duration = `${m}:${s < 10 ? '0' : ''}${s}`;
      }
    }

    // Check if we found valid streams
    const formats: VideoFormat[] = [];
    if (hdUrl && isAllowedCdnUrl(hdUrl)) {
      const resInfo = detectGenuineResolution(hdUrl, html, 'HD');
      formats.push({
        quality: resInfo.quality,
        resolution: resInfo.resolution,
        format: 'MP4',
        url: hdUrl,
        hasAudio: true
      });
    }
    if (sdUrl && isAllowedCdnUrl(sdUrl)) {
      const resInfo = detectGenuineResolution(sdUrl, html, 'SD');
      formats.push({
        quality: resInfo.quality,
        resolution: resInfo.resolution,
        format: 'MP4',
        url: sdUrl,
        hasAudio: true
      });
    }

    // If nothing found and login wall detected
    if (formats.length === 0) {
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

    // Resolve approximate file sizes concurrently without blocking
    await Promise.all(
      formats.map(async fmt => {
        const isHd = fmt.resolution?.includes('1080') || fmt.resolution?.includes('720') || fmt.quality.includes('HD');
        fmt.size = await getApproximateFileSize(fmt.url, durationSec, isHd);
      })
    );

    return {
      success: true,
      title: title || 'Public Facebook Video',
      thumbnail: thumbnail || '',
      duration,
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
