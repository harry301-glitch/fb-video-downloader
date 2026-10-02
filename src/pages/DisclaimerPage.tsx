import { Link } from 'react-router-dom';
import { AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead.tsx';
import { AdContainer } from '../components/AdContainer.tsx';

export function DisclaimerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEOHead
        title="Legal Disclaimer – Facebook Video Downloader"
        description="Important legal disclaimer regarding independent operation, non-affiliation with Meta Platforms Inc. / Facebook, user copyright compliance, and DMCA notices."
      />

      <section className="bg-slate-50 border-b border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
            Legal & Trademark Notice
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Legal Disclaimer
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
        {/* Highlight Notice */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Non-Affiliation Notice</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            <strong>Facebook Video Downloader</strong> is an independent software tool and website. It is NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with Meta Platforms, Inc., Facebook, Instagram, or any of their subsidiaries or affiliates.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            1. Trademarks & Intellectual Property of Third Parties
          </h2>
          <p>
            The official Meta Platforms, Inc. website can be found at <a href="https://about.meta.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">about.meta.com</a>. The name "Facebook", as well as related names, marks, emblems, and logos, are registered trademarks of their respective owners.
          </p>
          <p>
            The use of the name "Facebook" on this website is strictly descriptive and nominative to identify the public web platform from which public video URLs are derived. It does not imply endorsement, sponsorship, or partnership.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            2. User Responsibility & Copyright Compliance
          </h2>
          <p>
            Users of this service bear the sole responsibility of ensuring that they have the legal right, authorization, or fair use justification to download and archive any video content.
          </p>
          <p>
            This website does not grant, convey, or license any rights to videos or audio streams accessed via our tool. All copyright, intellectual property, and moral rights remain entirely with the original content creators, publishers, and copyright holders.
          </p>
          <p>
            Downloading copyrighted material without authorization may violate national copyright statutes, civil laws, and platform terms of service. You agree to hold harmless and indemnify Facebook Video Downloader against any claims, losses, or legal liabilities arising from your use of the tool.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            3. Technical Access Boundaries
          </h2>
          <p>
            Our technology is specifically engineered to interact exclusively with publicly accessible media that requires no credentials, cookies, or authentication. We do not provide mechanisms to bypass:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Facebook login walls or user credentials</li>
            <li>Closed, secret, or private groups</li>
            <li>Videos restricted to "Friends" or customized audience lists</li>
            <li>Digital Rights Management (DRM) or encryption measures</li>
            <li>Geographical or age-based content blocks</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            4. DMCA & Copyright Inquiries
          </h2>
          <p>
            Because we do not host, store, or archive any video or audio files on our servers, we cannot directly "remove" files from the Internet. Media streams are hosted on third-party public content delivery networks.
          </p>
          <p>
            However, if you are a copyright owner or an agent thereof and believe that your rights are being infringed, or if you request domain-level blocking for specific URLs, please submit a detailed inquiry through our <Link to="/contact" className="text-blue-600 hover:underline">contact page</Link> with:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm">
            <li>Identification of the copyrighted work claimed to be infringed.</li>
            <li>The exact URL of the material.</li>
            <li>Your contact information (name, address, email).</li>
            <li>A statement of good faith belief that the disputed use is unauthorized.</li>
          </ul>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
        <AdContainer slot="FOOTER" />
      </div>
    </div>
  );
}
