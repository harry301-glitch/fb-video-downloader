import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Lock, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead.tsx';
import { AdContainer } from '../components/AdContainer.tsx';

export function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEOHead
        title="About Us – Facebook Video Downloader"
        description="Learn about the engineering, privacy principles, and mission behind Facebook Video Downloader, the trusted online utility for public video archiving."
      />

      {/* Header */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
            Our Mission & Principles
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            About Facebook Video Downloader
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            A fast, modern, and privacy-respecting online utility built to help users download publicly accessible Facebook videos.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <AdContainer slot="TOP" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Story & Purpose */}
        <section className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
          <h2 className="text-2xl font-bold text-slate-900">
            Our Mission
          </h2>
          <p>
            Facebook is one of the world's most vibrant platforms for video sharing, housing countless educational lectures, news footage, product demonstrations, and entertaining reels. However, for educators preparing classroom presentations, content creators archiving their own uploads, and researchers cataloging public discourse, downloading high-definition video offline has historically been fraught with bloated software, suspicious malware bundles, and deceptive advertisements.
          </p>
          <p>
            We created <strong>Facebook Video Downloader</strong> to restore clarity, simplicity, and safety to video downloading. Our tool provides a clean, web-first interface that extracts publicly available media streams directly in your browser without requiring extensions, installations, or registration.
          </p>
        </section>

        {/* Core Architectural Pillars */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Core Principles & Standards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                1. Only Public & Authorized Content
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We strictly operate within public access boundaries. We do not bypass logins, private account settings, paywalls, or digital rights management (DRM).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                2. Zero Credential Collection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You never provide user credentials or passwords. Our servers never ask you to authenticate with Facebook, preventing any potential account security risks.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                3. High-Speed Architecture
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Lightweight serverless endpoints parse public OpenGraph and video tags within milliseconds, routing high-definition MP4 streams directly to your device.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                4. Cross-Platform Accessibility
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Engineered from the ground up to render flawlessly on smartphones, tablets, laptops, and desktop workstations with zero layout shifts.
              </p>
            </div>
          </div>
        </section>

        <AdContainer slot="IN_ARTICLE" />

        {/* Non-Affiliation Notice */}
        <section className="p-6 rounded-2xl bg-slate-100 border border-slate-200 space-y-3 text-sm text-slate-700">
          <h3 className="font-bold text-slate-900 text-base">
            Independent Service & Trademark Notice
          </h3>
          <p>
            Facebook Video Downloader is an independent utility. It is not endorsed by, directly affiliated with, maintained, authorized, or sponsored by Meta Platforms, Inc. or Facebook. The name "Facebook" as well as related names, marks, emblems, and images are registered trademarks of their respective owners. The use of any trade name or trademark is for identification and reference purposes only.
          </p>
        </section>

        {/* Ready to Download CTA */}
        <div className="text-center pt-4">
          <Link
            to="/#downloader"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
          >
            <span>Start using Facebook Video Downloader</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
        <AdContainer slot="FOOTER" />
      </div>
    </div>
  );
}
