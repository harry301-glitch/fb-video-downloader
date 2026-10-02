import { Link } from 'react-router-dom';
import { Download, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Download className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-bold text-white text-xl tracking-tight">
                Facebook Video Downloader
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Fast, simple and responsible video downloading for publicly accessible content.
              Our utility helps creators, educators, and social media managers archive their authorized videos in high definition.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>We never bypass logins, paywalls, or private account restrictions.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Legal & Trust
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sponsored Partner Offers (Smartlink) */}
        <div className="py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Sponsored Partner Offers:
          </span>
          <a
            href="https://www.profitableratecpmnetwork.com/aqzkxztmz?key=1087b3c02c9711fab46af433b46bf244"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60"
          >
            <span>Explore Trending Online Tools & Offers</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="py-6 text-xs text-slate-400 border-b border-slate-800 leading-relaxed">
          <p>
            <strong className="text-slate-300">Disclaimer:</strong> Facebook Video Downloader is an independent utility and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Meta Platforms, Inc., Facebook, or any of their subsidiaries. All trademarks, service marks, and trade names referenced on this site belong to their respective owners. Users must strictly ensure they have appropriate authorization and copyright permissions before downloading or repurposing any third-party video content.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} Facebook Video Downloader. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern web standards & performance optimization
          </p>
        </div>
      </div>
    </footer>
  );
}
