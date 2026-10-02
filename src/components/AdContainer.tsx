import { useEffect, useRef, useState, useId } from 'react';

export type AdSlot =
  | 'TOP'
  | 'BELOW_HERO'
  | 'CONTENT'
  | 'BETWEEN_DOWNLOADER_CONTENT'
  | 'BELOW_RESULT'
  | 'IN_ARTICLE'
  | 'NATIVE_ARTICLE'
  | 'BEFORE_FAQ'
  | 'AFTER_FAQ'
  | 'FOOTER'
  | 'DESKTOP_SIDEBAR'
  | 'SMARTLINK';

export type AdFormat =
  | 'leaderboard'
  | 'banner'
  | 'rectangle'
  | 'native'
  | 'skyscraper'
  | 'skyscraper_compact'
  | 'smartlink'
  | 'auto';

interface AdContainerProps {
  slot: AdSlot;
  format?: AdFormat;
  className?: string;
  lazy?: boolean;
}

/**
 * Adsterra Ad Unit Configurations (Live Account Keys)
 */
export const ADSTERRA_UNITS = {
  // Banner 728x90 (Unit ID: 31524848)
  BANNER_728x90: {
    key: 'a24e50c842413dbf5129a850bf545c66',
    width: 728,
    height: 90,
    scriptUrl: 'https://www.highrevenueformat.com/a24e50c842413dbf5129a850bf545c66/invoke.js'
  },
  // Banner 468x60 (Unit ID: 31524843)
  BANNER_468x60: {
    key: '68ee8df82436bb15de450cf7ba2d99e2',
    width: 468,
    height: 60,
    scriptUrl: 'https://www.highrevenueformat.com/68ee8df82436bb15de450cf7ba2d99e2/invoke.js'
  },
  // Banner 320x50 (Unit ID: 31524847)
  BANNER_320x50: {
    key: 'c36725b09727b790c6722e8b3ed94f67',
    width: 320,
    height: 50,
    scriptUrl: 'https://www.highrevenueformat.com/c36725b09727b790c6722e8b3ed94f67/invoke.js'
  },
  // Banner 300x250 (Unit ID: 31524844)
  BANNER_300x250: {
    key: 'def25f3cdb4c67a2cf1722f370602eed',
    width: 300,
    height: 250,
    scriptUrl: 'https://www.highrevenueformat.com/def25f3cdb4c67a2cf1722f370602eed/invoke.js'
  },
  // Banner 160x600 Skyscraper (Unit ID: 31524846)
  BANNER_160x600: {
    key: '48c20947341c1c51956d7c48a99beee0',
    width: 160,
    height: 600,
    scriptUrl: 'https://www.highrevenueformat.com/48c20947341c1c51956d7c48a99beee0/invoke.js'
  },
  // Banner 160x300 (Unit ID: 31524845)
  BANNER_160x300: {
    key: '42cfe8022c0763bf3b1a38f9ba415793',
    width: 160,
    height: 300,
    scriptUrl: 'https://www.highrevenueformat.com/42cfe8022c0763bf3b1a38f9ba415793/invoke.js'
  },
  // Native Banner (Unit ID: 31524842)
  NATIVE_BANNER: {
    containerId: 'container-c6b365e84bc8c32ef5109004e62d6723',
    scriptUrl: 'https://pl31625341.profitableratecpmnetwork.com/c6b365e84bc8c32ef5109004e62d6723/invoke.js'
  },
  // Smartlink (Unit ID: 31524841)
  SMARTLINK: 'https://www.profitableratecpmnetwork.com/aqzkxztmz?key=1087b3c02c9711fab46af433b46bf244'
};

/**
 * Isolated Sandboxed Iframe for Adsterra Standard Banners
 * Using an isolated srcDoc iframe guarantees:
 * 1. Global 'atOptions' never collides between banners of different dimensions
 * 2. Adsterra's 'document.write' does not interfere with the React DOM
 * 3. Zero duplicate script errors across re-renders
 * 4. Responsive max-width constraints prevent horizontal scrolling on mobile
 */
function AdsterraIframe({
  adKey,
  width,
  height,
  scriptUrl
}: {
  adKey: string;
  width: number;
  height: number;
  scriptUrl: string;
}) {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${adKey}',
      'format' : 'iframe',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="${scriptUrl}"></script>
</body>
</html>`;

  return (
    <iframe
      title={`Advertisement ${width}x${height}`}
      srcDoc={htmlContent}
      width={width}
      height={height}
      className="border-0 overflow-hidden mx-auto block max-w-full"
      style={{ border: 'none', overflow: 'hidden' }}
      scrolling="no"
      loading="lazy"
    />
  );
}

/**
 * Adsterra Native Banner Unit
 */
function AdsterraNativeBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current || !containerRef.current) return;
    injectedRef.current = true;

    const script = document.createElement('script');
    script.src = ADSTERRA_UNITS.NATIVE_BANNER.scriptUrl;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden">
      <div
        id={ADSTERRA_UNITS.NATIVE_BANNER.containerId}
        ref={containerRef}
        className="w-full min-h-[90px] flex items-center justify-center"
      />
    </div>
  );
}

/**
 * Adsterra Smartlink Sponsored Recommendation
 */
function AdsterraSmartlink() {
  return (
    <a
      href={ADSTERRA_UNITS.SMARTLINK}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-700 text-xs font-medium transition-colors"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      <span>Sponsored: Recommended Web Tools & Offers</span>
    </a>
  );
}

export function AdContainer({
  slot,
  format = 'auto',
  className = '',
  lazy = true
}: AdContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const safeId = `adsterra-${slot.toLowerCase().replace(/_/g, '-')}-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [isVisible, setIsVisible] = useState(!lazy);

  // Map slot to appropriate default ad format if 'auto'
  const resolvedFormat: AdFormat = format !== 'auto' ? format : (() => {
    switch (slot) {
      case 'DESKTOP_SIDEBAR':
        return 'skyscraper';
      case 'BELOW_RESULT':
        return 'rectangle';
      case 'NATIVE_ARTICLE':
      case 'IN_ARTICLE':
        return 'native';
      case 'SMARTLINK':
        return 'smartlink';
      case 'BELOW_HERO':
      case 'TOP':
      case 'BETWEEN_DOWNLOADER_CONTENT':
      case 'CONTENT':
      case 'BEFORE_FAQ':
      case 'AFTER_FAQ':
      case 'FOOTER':
      default:
        return 'leaderboard';
    }
  })();

  // IntersectionObserver for lazy-loading lower-page ads without blocking downloader interface
  useEffect(() => {
    if (!lazy || isVisible) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, isVisible]);

  // Render Smartlink format directly
  if (resolvedFormat === 'smartlink') {
    return (
      <div className={`w-full flex justify-center my-3 ${className}`}>
        <AdsterraSmartlink />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id={safeId}
      className={`w-full max-w-full overflow-hidden my-4 sm:my-6 flex flex-col items-center justify-center relative z-0 pointer-events-auto ${
        resolvedFormat === 'skyscraper' ? 'hidden xl:flex' : ''
      } ${className}`}
      data-adsterra-slot={slot}
      data-adsterra-format={resolvedFormat}
    >
      {/* Visually distinguishable "Advertisement" label */}
      <div className="flex items-center gap-1.5 mb-1 select-none">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Advertisement
        </span>
      </div>

      {/* Ad Box */}
      <div className="w-full flex flex-col items-center justify-center overflow-hidden">
        {isVisible ? (
          <>
            {/* 1. Responsive Horizontal Banner Slot (Uses 728x90 on Desktop, 468x60 on Tablet, 320x50 on Mobile) */}
            {resolvedFormat === 'leaderboard' && (
              <div className="w-full flex justify-center items-center overflow-hidden min-h-[50px] sm:min-h-[60px] md:min-h-[90px]">
                {/* Desktop: Banner 728x90 */}
                <div className="hidden md:block">
                  <AdsterraIframe
                    adKey={ADSTERRA_UNITS.BANNER_728x90.key}
                    width={ADSTERRA_UNITS.BANNER_728x90.width}
                    height={ADSTERRA_UNITS.BANNER_728x90.height}
                    scriptUrl={ADSTERRA_UNITS.BANNER_728x90.scriptUrl}
                  />
                </div>

                {/* Tablet: Banner 468x60 */}
                <div className="hidden sm:block md:hidden">
                  <AdsterraIframe
                    adKey={ADSTERRA_UNITS.BANNER_468x60.key}
                    width={ADSTERRA_UNITS.BANNER_468x60.width}
                    height={ADSTERRA_UNITS.BANNER_468x60.height}
                    scriptUrl={ADSTERRA_UNITS.BANNER_468x60.scriptUrl}
                  />
                </div>

                {/* Mobile: Banner 320x50 */}
                <div className="block sm:hidden">
                  <AdsterraIframe
                    adKey={ADSTERRA_UNITS.BANNER_320x50.key}
                    width={ADSTERRA_UNITS.BANNER_320x50.width}
                    height={ADSTERRA_UNITS.BANNER_320x50.height}
                    scriptUrl={ADSTERRA_UNITS.BANNER_320x50.scriptUrl}
                  />
                </div>
              </div>
            )}

            {/* 2. Banner 300x250 (Below Video Results or Content) */}
            {resolvedFormat === 'rectangle' && (
              <div className="w-full max-w-[300px] min-h-[250px] flex justify-center items-center overflow-hidden mx-auto">
                <AdsterraIframe
                  adKey={ADSTERRA_UNITS.BANNER_300x250.key}
                  width={ADSTERRA_UNITS.BANNER_300x250.width}
                  height={ADSTERRA_UNITS.BANNER_300x250.height}
                  scriptUrl={ADSTERRA_UNITS.BANNER_300x250.scriptUrl}
                />
              </div>
            )}

            {/* 3. Banner 468x60 */}
            {resolvedFormat === 'banner' && (
              <div className="w-full max-w-[468px] min-h-[60px] flex justify-center items-center overflow-hidden mx-auto">
                <AdsterraIframe
                  adKey={ADSTERRA_UNITS.BANNER_468x60.key}
                  width={ADSTERRA_UNITS.BANNER_468x60.width}
                  height={ADSTERRA_UNITS.BANNER_468x60.height}
                  scriptUrl={ADSTERRA_UNITS.BANNER_468x60.scriptUrl}
                />
              </div>
            )}

            {/* 4. Native Banner */}
            {resolvedFormat === 'native' && <AdsterraNativeBanner />}

            {/* 5. Desktop Sidebar Skyscraper 160x600 (Strictly Desktop XL, Never Mobile) */}
            {resolvedFormat === 'skyscraper' && (
              <div className="w-[160px] min-h-[600px] flex justify-center items-center overflow-hidden">
                <AdsterraIframe
                  adKey={ADSTERRA_UNITS.BANNER_160x600.key}
                  width={ADSTERRA_UNITS.BANNER_160x600.width}
                  height={ADSTERRA_UNITS.BANNER_160x600.height}
                  scriptUrl={ADSTERRA_UNITS.BANNER_160x600.scriptUrl}
                />
              </div>
            )}

            {/* 6. Desktop Sidebar Compact 160x300 */}
            {resolvedFormat === 'skyscraper_compact' && (
              <div className="w-[160px] min-h-[300px] flex justify-center items-center overflow-hidden">
                <AdsterraIframe
                  adKey={ADSTERRA_UNITS.BANNER_160x300.key}
                  width={ADSTERRA_UNITS.BANNER_160x300.width}
                  height={ADSTERRA_UNITS.BANNER_160x300.height}
                  scriptUrl={ADSTERRA_UNITS.BANNER_160x300.scriptUrl}
                />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-12 flex items-center justify-center text-slate-300 text-xs">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
