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

  const [selectedFormat, setSelectedFormat] = useState<import('../services/api.ts').VideoFormat>(
    formats[0] || {
      id: '720p',
      resolution: '720p',
      quality: '720p HD',
      label: 'HD',
      height: 720,
      format: 'MP4',
      url: '',
      size: '~3.8 MB',
      videoCodec: 'H.264',
      audioCodec: 'AAC',
      hasAudio: true,
      durationFormatted: duration || '00:08',
      durationSec: 8,
      videoBitrateKbps: 3600,
      audioBitrateKbps: 160
    }
  );

  const handleDownload = async (format: import('../services/api.ts').VideoFormat) => {
    trackQualitySelected(format.quality);
    setDownloadError(null);
    setDownloadingQuality(format.quality);

    // Build a clean, safe filename
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').replace(/_{2,}/g, '_').slice(0, 40) || 'facebook_video';
    const qualTag = format.resolution || format.id || 'video';
    const filename = `${safeTitle}_${qualTag}.mp4`;

    try {
      // Trigger same-origin streaming download via Netlify Functions / Express without page navigation
      await downloadVideoFile(format.url, filename, format.resolution || format.id);
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

            {/* Quality Options Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Select Video Quality:
                </span>
                <span className="text-xs text-slate-400">
                  {formats.length} genuinely available
                </span>
              </div>

              {/* Quality Selector Pills/Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {formats.map((fmt) => {
                  const isSelected = selectedFormat.id === fmt.id;
                  const isHd = fmt.height >= 720 || fmt.quality.includes('HD');

                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-xs ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                          {fmt.resolution} {fmt.label}
                        </span>
                        {isHd && <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{fmt.size}</span>
                        <span className="text-[10px] text-emerald-600 font-medium">MP4</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Stream Specs Information Card */}
              <div className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Resolution</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedFormat.quality}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Codecs</span>
                  <span className="font-semibold text-slate-700">{selectedFormat.videoCodec} + {selectedFormat.audioCodec}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Estimated Size</span>
                  <span className="font-bold text-blue-600 text-sm">{selectedFormat.size}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Duration</span>
                  <span className="font-semibold text-slate-700">{duration || selectedFormat.durationFormatted || '00:08'}</span>
                </div>
              </div>

              {/* Primary Action Button for Selected Quality */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedFormat)}
                  disabled={downloadingQuality !== null}
                  className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all text-sm sm:text-base cursor-pointer"
                >
                  {downloadingQuality === selectedFormat.quality ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Preparing {selectedFormat.resolution} download...</span>
                    </>
                  ) : downloadSuccessQuality === selectedFormat.quality ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-300" />
                      <span>Saved {selectedFormat.resolution} to device</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download {selectedFormat.quality} ({selectedFormat.size})</span>
                    </>
                  )}
                </button>
              </div>

              {/* All Available Quality Rows */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  All Format Options:
                </span>
                <div className="flex flex-col gap-2">
                  {formats.map((fmt) => {
                    const isHd = fmt.height >= 720 || fmt.quality.includes('HD');
                    const isDownloading = downloadingQuality === fmt.quality;
                    const isSuccess = downloadSuccessQuality === fmt.quality;

                    return (
                      <div
                        key={fmt.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isHd
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {fmt.resolution}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{fmt.quality}</span>
                              {isHd && <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                            </div>
                            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span>MP4</span>
                              <span aria-hidden="true">·</span>
                              <span>{fmt.videoCodec} + {fmt.audioCodec}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-700 font-medium">Audio Included</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                {fmt.size}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownload(fmt)}
                          disabled={downloadingQuality !== null}
                          className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer ${
                            isHd
                              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white disabled:bg-blue-400'
                              : 'bg-slate-800 hover:bg-slate-900 active:bg-black text-white disabled:bg-slate-500'
                          }`}
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              <span>Preparing...</span>
                            </>
                          ) : isSuccess ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>{fmt.resolution}</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
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
