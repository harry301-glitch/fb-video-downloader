import { useState } from 'react';
import { Download, Film, Check, ExternalLink, RefreshCw, Clock, Sparkles, Loader2, AlertCircle, X } from 'lucide-react';
import { VideoExtractionResponse, downloadVideoFile } from '../services/api.ts';
import { trackQualitySelected } from '../utils/analytics.ts';

interface ResultCardProps {
  data: VideoExtractionResponse;
  originalUrl: string;
  onReset: () => void;
}

export function ResultCard({ data, originalUrl, onReset }: ResultCardProps) {
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);
  const [downloadSuccessQuality, setDownloadSuccessQuality] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const title = data.title || 'Public Facebook Video';
  const thumbnail = data.thumbnail;
  const duration = data.duration;
  const formats = data.formats || [];

  const handleDownload = async (format: { quality: string; format: string; url: string }) => {
    trackQualitySelected(format.quality);
    setDownloadError(null);
    setDownloadingQuality(format.quality);

    // Build a clean, safe filename
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').replace(/_{2,}/g, '_').slice(0, 40) || 'facebook_video';
    const filename = `${safeTitle}_${format.quality}.mp4`;

    try {
      // Trigger same-origin streaming download via Netlify Functions / Express without page navigation
      await downloadVideoFile(format.url, filename, format.quality);
      setDownloadSuccessQuality(format.quality);
      setTimeout(() => {
        setDownloadSuccessQuality(null);
      }, 3000);
    } catch (err: unknown) {
      console.error('Download error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to download video file. Please try again.';
      setDownloadError(msg);
    } finally {
      setDownloadingQuality(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 p-5 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-slate-800">
              Video Ready for Download
            </span>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors p-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Download Another</span>
          </button>
        </div>

        {/* Download Error Banner */}
        {downloadError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3 text-sm animate-in fade-in duration-200"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Download Failed</p>
                <p className="text-xs text-rose-700 mt-0.5">{downloadError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDownloadError(null)}
              className="text-rose-500 hover:text-rose-800 p-1"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Video Preview / Thumbnail */}
          <div className="md:col-span-5 relative group overflow-hidden rounded-xl bg-slate-900 border border-slate-200 shadow-sm aspect-video flex items-center justify-center">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={e => {
                  // Fallback if FB CDN image is restricted
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                <Film className="w-12 h-12 stroke-1 mb-2 text-slate-500" />
                <span className="text-xs">Facebook Video Stream</span>
              </div>
            )}

            {duration && (
              <div className="absolute bottom-2 right-2 bg-slate-900/90 text-white text-[11px] font-mono px-2 py-0.5 rounded shadow">
                <Clock className="w-3 h-3 inline mr-1" />
                {duration}
              </div>
            )}
          </div>

          {/* Video Details & Formats */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                {title}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <span>Format: MP4</span>
                <span aria-hidden="true">·</span>
                <span>Type: Video & Audio</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">Verified Public</span>
              </div>
            </div>

            {/* Quality Options */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Select Quality Option:
              </span>

              <div className="flex flex-col gap-2.5">
                {formats.map((fmt, index) => {
                  const isHd = fmt.quality === 'HD';
                  const isDownloading = downloadingQuality === fmt.quality;
                  const isSuccess = downloadSuccessQuality === fmt.quality;

                  return (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isHd
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {fmt.quality}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{fmt.quality === 'HD' ? 'High Definition (HD)' : 'Standard Definition (SD)'}</span>
                            {isHd && <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-xs text-slate-500">
                            MP4 Video · Highest available stream bitrate
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownload(fmt)}
                        disabled={isDownloading}
                        className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
                          isHd
                            ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white disabled:bg-blue-400'
                            : 'bg-slate-800 hover:bg-slate-900 active:bg-black text-white disabled:bg-slate-500'
                        }`}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Preparing download...</span>
                          </>
                        ) : isSuccess ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>Saved to device</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download {fmt.quality}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct stream link fallback */}
            <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
              <a
                href={formats[0]?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 hover:underline"
              >
                <span>Open direct media stream in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="text-[11px] text-slate-400">
                Fast direct CDN connection
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
