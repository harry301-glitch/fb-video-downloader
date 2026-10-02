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
  | 'DESKTOP_SIDEBAR';

export type AdFormat = 'leaderboard' | 'banner' | 'rectangle' | 'native' | 'skyscraper' | 'auto';

interface AdContainerProps {
  slot: AdSlot;
  format?: AdFormat;
  className?: string;
  lazy?: boolean;
}

// Global script registry to avoid duplicate script injections across React re-renders
const loadedAdsterraScripts = new Set<string>();

/**
 * Clean, professional Adsterra container component.
 * - Enforces zero horizontal scroll on mobile (max-w-full, overflow-hidden)
 * - Clear, muted "Advertisement" labeling for visual distinction from tool buttons
 * - Format-specific responsive dimensions to prevent Cumulative Layout Shift (CLS)
 * - Safe lazy-loading for lower-page slots to preserve initial download tool speed
 * - Strictly non-overlapping: never covers inputs, video previews, or download buttons
 */
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

  // Adsterra script integration hook
  useEffect(() => {
    if (!isVisible) return;

    const isEnabled = import.meta.env.VITE_ADSTERRA_ENABLED === 'true';
    if (!isEnabled || !containerRef.current) return;

    // Check if container already mounted an ad instance to prevent duplicates
    const scriptKey = `adsterra-script-${slot}`;
    if (!loadedAdsterraScripts.has(scriptKey)) {
      loadedAdsterraScripts.add(scriptKey);
      // Adsterra snippet mounting point (activated when production key is supplied in .env)
    }
  }, [isVisible, slot]);

  // Dimension classes based on ad format
  const getFormatClasses = () => {
    switch (resolvedFormat) {
      case 'skyscraper':
        // Desktop sidebar skyscraper: strictly 160x600, hidden on mobile/tablet, visible only on large screens
        return 'w-[160px] min-h-[600px] hidden xl:flex shrink-0';
      case 'rectangle':
        // Medium rectangle: 300x250, mobile-friendly and desktop content
        return 'w-full max-w-[300px] min-h-[250px] mx-auto';
      case 'banner':
        // Standard banner: 468x60 on tablets/desktop, 320x50 on mobile
        return 'w-full max-w-[320px] sm:max-w-[468px] min-h-[50px] sm:min-h-[60px] mx-auto';
      case 'native':
        // Native responsive widget
        return 'w-full max-w-4xl min-h-[110px] sm:min-h-[130px] mx-auto';
      case 'leaderboard':
      default:
        // Responsive leaderboard: 320x50 on mobile, 468x60 on tablet, 728x90 on desktop
        return 'w-full max-w-[320px] sm:max-w-[468px] md:max-w-[728px] min-h-[50px] sm:min-h-[60px] md:min-h-[90px] mx-auto';
    }
  };

  // Slot comment for Adsterra deployment verification
  const slotComment = `<!-- ADSTERRA_${slot}_BANNER -->`;

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
      {/* HTML comment explicitly for Adsterra deployment insertion */}
      <span dangerouslySetInnerHTML={{ __html: slotComment }} />

      {/* Visually distinguishable "Advertisement" label */}
      <div className="flex items-center gap-1.5 mb-1.5 select-none">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Advertisement
        </span>
      </div>

      {/* Styled ad slot reservation to avoid layout shifting (CLS) */}
      <div
        className={`${getFormatClasses()} border border-dashed border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 rounded-xl flex flex-col items-center justify-center p-3 text-center transition-colors overflow-hidden`}
      >
        <span className="text-[11px] font-medium text-slate-400">
          Adsterra {resolvedFormat.toUpperCase()} ({slot.replace(/_/g, ' ')})
        </span>
        <span className="text-[10px] text-slate-400/80 mt-0.5">
          {resolvedFormat === 'leaderboard'
            ? '728×90 Desktop · 320×50 Mobile'
            : resolvedFormat === 'rectangle'
            ? '300×250 Medium Rectangle'
            : resolvedFormat === 'skyscraper'
            ? '160×600 Skyscraper'
            : 'Responsive Native Placement'}
        </span>
      </div>
    </div>
  );
}
