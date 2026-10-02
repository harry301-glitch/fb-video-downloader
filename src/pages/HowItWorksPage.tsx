import { Link } from 'react-router-dom';
import {
  Download,
  Share2,
  Copy,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead.tsx';
import { AdContainer } from '../components/AdContainer.tsx';

export function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEOHead
        title="How It Works – Facebook Video Downloader Guide"
        description="Learn how to copy public Facebook video links and download them on iPhone, Android, and PC with our easy step-by-step tutorial."
      />

      {/* Hero Header */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
            User Guide & Tutorials
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            How to Download Facebook Videos
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            A comprehensive guide to downloading public Facebook videos, reels, and clips across mobile devices and desktop computers.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <AdContainer slot="TOP" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Mobile Guide */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                On Mobile (iOS & Android)
              </h2>
              <p className="text-xs text-slate-500">
                Using the Facebook App or Mobile Web Browser
              </p>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold mb-1">
                  Open Facebook and Find the Video
                </strong>
                Navigate to the public video, reel, or watch post you want to save. Make sure the post visibility icon is a small globe (Public), not a silhouette (Friends only).
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold mb-1">
                  Tap "Share" and "Copy Link"
                </strong>
                Tap the <Share2 className="w-4 h-4 inline text-slate-600 mx-1" /> <strong>Share</strong> button located at the bottom right of the post. In the options sheet that slides up, tap <strong>Copy Link</strong>. The URL is now stored in your device clipboard.
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold mb-1">
                  Paste & Download
                </strong>
                Open Safari, Chrome, or your default mobile browser and visit <Link to="/" className="text-blue-600 font-medium hover:underline">Facebook Video Downloader</Link>. Tap the "Paste" button, hit "Download", and pick your resolution (HD or SD).
              </div>
            </div>
          </div>
        </section>

        {/* Content Ad */}
        <AdContainer slot="IN_ARTICLE" />

        {/* Desktop Guide */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                On Desktop (Windows, macOS, Linux)
              </h2>
              <p className="text-xs text-slate-500">
                Using Chrome, Safari, Firefox, Edge, or Brave
              </p>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold mb-1">
                  Copy URL From Address Bar
                </strong>
                When viewing the video post on Facebook in your desktop browser, highlight and copy the full URL in the top address bar (<code className="text-xs bg-slate-200 px-1 py-0.5 rounded">Ctrl + C</code> or <code className="text-xs bg-slate-200 px-1 py-0.5 rounded">Cmd + C</code>).
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold mb-1">
                  Paste Into Our Tool
                </strong>
                Return to the downloader card on our homepage, paste the copied address, and click <strong>Download</strong>.
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold mb-1">
                  Save to Your Computer
                </strong>
                Click "Download HD" to initiate the MP4 download directly into your default Downloads folder.
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting & Tips */}
        <section className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Troubleshooting & Tips</span>
          </div>
          <ul className="space-y-2 text-sm text-amber-900/90 leading-relaxed list-disc list-inside">
            <li>
              <strong>Private Videos Cannot Be Downloaded:</strong> If a video is inside a closed Facebook group, posted with "Friends only" visibility, or restricted to an account you follow, it cannot be downloaded.
            </li>
            <li>
              <strong>Make Sure the URL is Direct:</strong> Profile links (e.g. <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">facebook.com/username</code>) will not download; you must copy the specific video or reel link.
            </li>
            <li>
              <strong>Rate Limiting Protection:</strong> To ensure server stability for everyone, downloads are limited to 5 requests per minute per IP address.
            </li>
          </ul>
        </section>

        {/* Ready to Download CTA */}
        <div className="text-center pt-4">
          <Link
            to="/#downloader"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Ready to download a video? Try it now</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
        <AdContainer slot="FOOTER" />
      </div>
    </div>
  );
}
