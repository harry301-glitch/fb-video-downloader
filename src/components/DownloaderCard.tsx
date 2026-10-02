import { useState, useRef, FormEvent } from 'react';
import {
  Download,
  Clipboard,
  X,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Check,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { requestFacebookVideo, VideoExtractionResponse, VideoDownloadError } from '../services/api.ts';
import { trackDownloadAttempt, trackDownloadError, trackDownloadSuccess } from '../utils/analytics.ts';

interface DownloaderCardProps {
  onSuccess: (data: VideoExtractionResponse, originalUrl: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const EXAMPLE_URLS = [
  'https://www.facebook.com/watch/?v=10153231379946729',
  'https://fb.watch/abCdEf123/',
  'https://www.facebook.com/reel/1234567890123456',
  'https://www.facebook.com/natgeo/videos/10156123456789012'
];

export function DownloaderCard({ onSuccess, isLoading, setIsLoading }: DownloaderCardProps) {
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setUrl('');
    setErrorMessage(null);
    inputRef.current?.focus();
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setErrorMessage(null);
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 2000);
        }
      } else {
        inputRef.current?.focus();
      }
    } catch {
      // Browser permissions denied or not supported
      inputRef.current?.focus();
    }
  };

  const handleUseExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setErrorMessage(null);
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a valid public Facebook video URL.');
      inputRef.current?.focus();
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const hostname = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`).hostname;
      trackDownloadAttempt(hostname);
    } catch {
      trackDownloadAttempt('invalid');
    }

    try {
      const response = await requestFacebookVideo(trimmed);
      if (response.success && response.formats && response.formats.length > 0) {
        trackDownloadSuccess(response.formats[0].quality, response.formats[0].format);
        onSuccess(response, trimmed);
      } else {
        const errorMsg = response.error || 'This video appears to be private or unavailable.';
        setErrorMessage(errorMsg);
        trackDownloadError('UNAVAILABLE');
      }
    } catch (err: unknown) {
      if (err instanceof VideoDownloadError) {
        setErrorMessage(err.message);
        trackDownloadError(err.code);
      } else {
        setErrorMessage("We couldn't process this video right now. Please try again later.");
        trackDownloadError('UNKNOWN_ERROR');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="downloader" className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-5 sm:p-8 transition-all">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="fb-video-url" className="block text-sm font-semibold text-slate-800">
            Enter Public Facebook Video or Reel URL:
          </label>

          {/* Input Group with Paste / Clear / Submit */}
          <div className="relative flex flex-col sm:flex-row gap-2.5 sm:gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                id="fb-video-url"
                type="url"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading}
                placeholder="Paste Facebook video URL here..."
                className="w-full h-14 pl-4 pr-24 sm:pr-24 text-base text-slate-900 placeholder:text-slate-400 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl transition-all outline-none disabled:opacity-60 font-mono text-sm sm:text-base"
                autoComplete="off"
                spellCheck="false"
              />

              {/* Action buttons inside the right side of the input */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {url && (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Clear URL"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Clear input</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200/80 hover:bg-slate-200 active:bg-slate-300 rounded-md flex items-center gap-1 transition-colors"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Pasted</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Download Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="h-14 px-8 min-w-[140px] text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 flex items-start gap-3 text-sm animate-in fade-in duration-200"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-xs text-rose-700 mt-1">
                  Ensure the video is set to <strong>Public</strong> visibility and that you are using a standard Facebook video, watch, or reel link.
                </p>
              </div>
            </div>
          )}

          {/* Trust helper note */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Only download videos you have permission to use.
            </span>
            <span className="text-slate-400">100% Free · No registration · Secure</span>
          </div>

          {/* Example supported URLs */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Supported URL Formats:</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
              {EXAMPLE_URLS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseExample(sample)}
                  className="font-mono bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded border border-slate-200/70 transition-colors text-left truncate max-w-full sm:max-w-xs"
                  title={`Click to test: ${sample}`}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
