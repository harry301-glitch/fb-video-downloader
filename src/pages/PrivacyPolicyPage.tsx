import { SEOHead } from '../components/SEOHead.tsx';
import { AdContainer } from '../components/AdContainer.tsx';

export function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEOHead
        title="Privacy Policy – Facebook Video Downloader"
        description="Our Privacy Policy outlines how Facebook Video Downloader handles user privacy, analytics, cookies, and non-retention of video URLs."
      />

      <section className="bg-slate-50 border-b border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
            Legal Compliance
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-500">
            Last Updated: October 2026
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <AdContainer slot="TOP" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-700 leading-relaxed space-y-8 text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            1. Overview & Commitment to Privacy
          </h2>
          <p>
            At <strong>Facebook Video Downloader</strong>, accessible from our primary web address, the privacy of our visitors is of paramount importance to us. This Privacy Policy document describes the types of information collected and recorded by our platform and how we utilize it.
          </p>
          <p>
            We operate under a strict <em>data minimization</em> principle: we do not require account registration, do not collect personal login credentials, and do not track or store the video URLs you submit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            2. Video URLs and Download Data
          </h2>
          <p>
            When you enter a public Facebook URL into our downloader utility:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>The URL is processed entirely in volatile server memory solely to resolve public video metadata and MP4 stream endpoints.</li>
            <li>We do <strong>not</strong> save, log, database, or archive your requested URLs or the resulting media content.</li>
            <li>We do not host or store downloaded video files on our servers; media streams are transferred directly between the client and public content distribution networks.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            3. Server Logs & Rate Limiting
          </h2>
          <p>
            Like most web applications, our web servers automatically collect standard technical log information, including your IP address, browser type, referring/exit pages, and date/time stamps.
          </p>
          <p>
            Client IP addresses are transiently evaluated in-memory strictly for rate limiting (maximum 5 requests per minute) and Distributed Denial of Service (DDoS) mitigation. These records are not linked to identifiable personal information and are cleared automatically.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            4. Cookies and Web Beacons
          </h2>
          <p>
            Facebook Video Downloader does not use first-party tracking cookies for user profiling. Third-party vendors, including advertising networks and analytics providers, may use cookies, JavaScript, or Web Beacons in their respective advertisements or performance analytics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            5. Third-Party Advertising & Adsterra
          </h2>
          <p>
            We may partner with third-party advertising networks such as Adsterra to support the ongoing hosting and infrastructure costs of maintaining a free service. Third-party ad servers or networks use technologies in their advertisements and links that appear on our site, which are sent directly to your browser.
          </p>
          <p>
            These third parties may automatically receive your IP address when this occurs. You can choose to disable cookies through your individual browser options or via standard industry opt-out portals (such as the Digital Advertising Alliance or Network Advertising Initiative).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            6. Web Analytics
          </h2>
          <p>
            We may use Google Analytics 4 (GA4) with IP anonymization enabled to monitor macro-level aggregate usage metrics, such as overall visitor numbers, browser compatibility ratios, and general geographic regions. No personally identifiable information (PII) is collected or shared with external parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            7. Contact Information
          </h2>
          <p>
            If you have additional questions or require more information about our Privacy Policy, please contact us via our contact page.
          </p>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
        <AdContainer slot="FOOTER" />
      </div>
    </div>
  );
}
