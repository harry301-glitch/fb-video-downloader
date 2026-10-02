import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Copy,
  SlidersHorizontal,
  CheckCircle2,
  Smartphone,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { DownloaderCard } from '../components/DownloaderCard.tsx';
import { ResultCard } from '../components/ResultCard.tsx';
import { AdContainer } from '../components/AdContainer.tsx';
import { FaqAccordion } from '../components/FaqAccordion.tsx';
import { SEOHead } from '../components/SEOHead.tsx';
import { VideoExtractionResponse } from '../services/api.ts';
import { FAQ_DATA, getFaqSchema } from '../data/faqData.ts';

export function HomePage() {
  const [downloadResult, setDownloadResult] = useState<VideoExtractionResponse | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = (data: VideoExtractionResponse, originalUrl: string) => {
    setDownloadResult(data);
    setCurrentUrl(originalUrl);
  };

  const handleReset = () => {
    setDownloadResult(null);
    setCurrentUrl('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Facebook Video Downloader – Download Facebook Videos Online"
        description="Download publicly accessible Facebook videos online with our fast and easy Facebook Video Downloader."
        schema={getFaqSchema(FAQ_DATA)}
      />

      {/* Top Banner Advertisement Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <AdContainer slot="TOP" />
      </div>

      {/* Hero Section */}
      <section className="pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-blue-50/50 via-slate-50 to-white border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Fast & Free Online Utility</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Facebook Video Downloader
          </h1>

          <p className="mt-4 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
            Fast, reliable Facebook video downloads with a simple and seamless experience.
          </p>

          {/* Main Downloader Tool Card */}
          <div className="mt-8 sm:mt-10">
            <DownloaderCard
              onSuccess={handleSuccess}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>

          {/* Download Results Card */}
          {downloadResult && (
            <ResultCard
              data={downloadResult}
              originalUrl={currentUrl}
              onReset={handleReset}
            />
          )}
        </div>
      </section>

      {/* Content Banner Advertisement Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AdContainer slot="CONTENT" />
      </div>

      {/* How It Works (3 Steps) */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Save publicly accessible videos to your device in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 relative flex flex-col items-start transition-transform hover:-translate-y-1 duration-200">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-5 shadow-md shadow-blue-500/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Copy Video Link
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Copy the public Facebook video URL directly from your browser's address bar or via the "Share" menu on the Facebook app.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 relative flex flex-col items-start transition-transform hover:-translate-y-1 duration-200">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-5 shadow-md shadow-blue-500/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Paste URL
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Paste the URL into our downloader box above and click the "Download" button to fetch the publicly accessible video stream.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 relative flex flex-col items-start transition-transform hover:-translate-y-1 duration-200">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-5 shadow-md shadow-blue-500/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Download MP4
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose the available quality (HD 1080p or SD) and download the MP4 file directly to your smartphone, tablet, or desktop.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>View our detailed step-by-step visual guide for iOS and Android</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content Section 1: How to Download a Facebook Video */}
      <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                How to Download a Facebook Video
              </h2>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                A simple, reliable method to save public video content for authorized offline use.
              </p>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                Facebook is home to millions of educational clips, news segments, tutorials, and creative reels shared every day. When content creators, digital archivists, or authorized viewers need to keep a backup copy of a public clip for offline viewing or educational research, finding a clean and secure method is essential.
              </p>
              <p>
                Our <strong>Facebook Video Downloader</strong> provides a streamlined web utility designed to fetch and format video streams that have been published with unrestricted public access. You do not need to install browser plugins or run standalone executables on your system.
              </p>
              <p>
                To get started, simply locate the video on Facebook. On a desktop browser, copy the full URL from your address bar (for example: <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-xs">https://www.facebook.com/watch/?v=123456789</code>). On the Facebook mobile application for iOS or Android, tap the <strong>Share</strong> button located beneath the post and select <strong>Copy Link</strong>.
              </p>
              <p>
                Once copied, navigate to our website, paste the link into the designated field, and click <strong>Download</strong>. Our system will analyze the URL, check for public stream availability, and provide clean direct download links for the highest available resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* In-Article Advertisement Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AdContainer slot="IN_ARTICLE" />
      </div>

      {/* SEO Content Section 2: Why Use Our Facebook Video Downloader */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Why Use Our Facebook Video Downloader?
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Engineered with focus on speed, privacy, mobile responsiveness, and legal transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Simple & Intuitive Interface
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No complex configurations, misleading download buttons, or confusing prompts. One clean input box delivers your video format options instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Mobile-First Design
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Carefully optimized for iPhone Safari and Android mobile browsers. Enjoy large tap targets, zero horizontal scrolling, and native file saving.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Fast Server Processing
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Lightweight server-side extraction resolves public media headers in seconds, delivering high-speed responses without bloated client-side code.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Multiple Quality Options
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Whenever available on the original post, download High Definition (HD 1080p/720p) or data-saving Standard Definition (SD) in universal MP4.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                No Registration Required
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We never ask for your email address, phone number, Facebook login credentials, or personal information. Your privacy is respected.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Ethical & Safe Standards
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Strict adherence to access control boundaries: we only process public links and never bypass Facebook login walls or private restrictions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section on Homepage */}
      <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Find answers to commonly asked questions about our online Facebook video downloader.
            </p>
          </div>

          <FaqAccordion items={FAQ_DATA} />

          <div className="mt-8 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>Visit our full FAQ page with all questions and search</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Advertisement Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AdContainer slot="FOOTER" />
      </div>
    </div>
  );
}
