/**
 * Client API service for Facebook Video Extraction
 */

export interface VideoFormat {
  quality: string;
  resolution?: string;
  format: 'MP4';
  url: string;
  size?: string;
  hasAudio?: boolean;
}

export interface VideoExtractionResponse {
  success: boolean;
  title?: string;
  thumbnail?: string;
  duration?: string;
  formats?: VideoFormat[];
  error?: string;
}

export class VideoDownloadError extends Error {
  code: 'INVALID_URL' | 'UNSUPPORTED' | 'PRIVATE_VIDEO' | 'EXTRACTION_FAILED' | 'RATE_LIMIT' | 'NETWORK_ERROR';

  constructor(message: string, code: VideoDownloadError['code']) {
    super(message);
    this.name = 'VideoDownloadError';
    this.code = code;
  }
}

export async function requestFacebookVideo(url: string): Promise<VideoExtractionResponse> {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new VideoDownloadError('Please enter a valid public Facebook video URL.', 'INVALID_URL');
  }

  try {
    const res = await fetch('/api/facebook-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url: trimmed })
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      throw new VideoDownloadError(
        "We couldn't process this video right now. Please try again later.",
        'EXTRACTION_FAILED'
      );
    }

    if (!res.ok || !data.success) {
      if (res.status === 429) {
        throw new VideoDownloadError(
          'Too many requests. Please wait a moment and try again.',
          'RATE_LIMIT'
        );
      }
      if (res.status === 403 || res.status === 404 || data.error?.includes('private')) {
        throw new VideoDownloadError(
          'This video appears to be private or unavailable.',
          'PRIVATE_VIDEO'
        );
      }
      if (data.error?.includes('not currently supported')) {
        throw new VideoDownloadError(
          'This Facebook URL is not currently supported.',
          'UNSUPPORTED'
        );
      }
      if (data.error?.includes('valid')) {
        throw new VideoDownloadError(
          'Please enter a valid public Facebook video URL.',
          'INVALID_URL'
        );
      }

      throw new VideoDownloadError(
        data.error || "We couldn't process this video right now. Please try again later.",
        'EXTRACTION_FAILED'
      );
    }

    if (!data.formats || data.formats.length === 0) {
      throw new VideoDownloadError(
        'This video appears to be private or unavailable.',
        'PRIVATE_VIDEO'
      );
    }

    return data as VideoExtractionResponse;
  } catch (err: unknown) {
    if (err instanceof VideoDownloadError) {
      throw err;
    }
    throw new VideoDownloadError(
      'Network connection issue. Please check your internet and try again.',
      'NETWORK_ERROR'
    );
  }
}

/**
 * Returns a same-origin proxy download link to trigger native attachment download
 * Compatible with Netlify Functions (/api/download-video -> /.netlify/functions/download-video)
 */
export function getProxyDownloadUrl(targetUrl: string, filename: string, quality?: string): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const params = new URLSearchParams({
    url: targetUrl,
    filename: safeFilename
  });
  if (quality) params.set('quality', quality);
  return `/api/download-video?${params.toString()}`;
}

/**
 * Triggers a real, reliable file download without navigating the current page away
 */
export async function downloadVideoFile(
  targetUrl: string,
  filename: string,
  quality?: string
): Promise<void> {
  const downloadUrl = getProxyDownloadUrl(targetUrl, filename, quality);

  try {
    const res = await fetch(downloadUrl);
    if (!res.ok) {
      let errorMsg = 'Failed to download video file.';
      try {
        const data = await res.json();
        if (data.error) errorMsg = data.error;
      } catch {
        const text = await res.text();
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(objectUrl);
    }, 2000);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('An unexpected error occurred while downloading the video.');
  }
}
