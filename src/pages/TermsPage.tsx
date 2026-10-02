import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead.tsx';
import { AdContainer } from '../components/AdContainer.tsx';

export function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEOHead
        title="Terms of Service – Facebook Video Downloader"
        description="Review the terms and conditions for using Facebook Video Downloader, including responsible use, intellectual property requirements, and service boundaries."
      />

      <section className="bg-slate-50 border-b border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
            Terms of Use
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-500">
            Effective Date: October 2026
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <AdContainer slot="TOP" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-700 leading-relaxed space-y-8 text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using <strong>Facebook Video Downloader</strong> ("the Service", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            2. Responsible & Authorized Use
          </h2>
          <p>
            The Service is provided as an online utility for downloading publicly accessible media that you have explicit legal permission or authorization to access and store. You agree that:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>You will only submit URLs for videos that you own or for which you have obtained express authorization from the copyright holder.</li>
            <li>You will not use the Service to infringe upon the copyright, trademark, trade secret, or other proprietary rights of any third party.</li>
            <li>You will not redistribute, broadcast, sell, or commercially exploit downloaded media without appropriate licensing.</li>
            <li>You will comply with all applicable local, national, and international laws and regulations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            3. Prohibited Activities
          </h2>
          <p>
            When utilizing the Service, you agree strictly not to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Attempt to bypass, defeat, or interfere with any security-related features, authentication controls, login prompts, or digital rights management (DRM) mechanisms.</li>
            <li>Launch automated bots, scrapers, crawlers, or headless scripts against our API endpoints to overload our infrastructure.</li>
            <li>Exceed the established rate limit of 5 requests per IP per minute.</li>
            <li>Use the service to distribute malware, phishing schemes, or deceptive links.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            4. Service Availability & Limitations
          </h2>
          <p>
            The Service is provided on an "as-is" and "as-available" basis. We do not guarantee uninterrupted, secure, or error-free operation. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without notice.
          </p>
          <p>
            Because we do not control third-party platforms or video hosting configurations, we cannot guarantee that every Facebook URL can be resolved or that high-definition streams will always be available.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            5. Limitation of Liability
          </h2>
          <p>
            In no event shall Facebook Video Downloader, its developers, operators, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use or inability to use the Service, including any copyright disputes resulting from your downloading or utilization of third-party content.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            6. Changes to Terms
          </h2>
          <p>
            We may revise these Terms of Service periodically. Updated terms will take effect immediately upon publication on this page. Your continued use of the Service following any revisions constitutes your acceptance of the updated terms.
          </p>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
        <AdContainer slot="FOOTER" />
      </div>
    </div>
  );
}
