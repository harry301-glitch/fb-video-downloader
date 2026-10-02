import { useEffect, useRef } from 'react';

export type AdSlot = 'TOP' | 'CONTENT' | 'IN_ARTICLE' | 'FOOTER';

interface AdContainerProps {
  slot: AdSlot;
  className?: string;
}

export function AdContainer({ slot, className = '' }: AdContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Slot comment names matching Adsterra placement guidelines
  const slotComment = `<!-- ADSTERRA_${slot}_BANNER -->`;

  useEffect(() => {
    // When enabled via environment variable or production key,
    // third-party Adsterra script tags can be mounted here dynamically.
    if (import.meta.env.VITE_ADSTERRA_ENABLED === 'true' && containerRef.current) {
      // Adsterra script injection point
    }
  }, [slot]);

  return (
    <div
      className={`w-full my-6 flex flex-col items-center justify-center transition-all ${className}`}
      data-adsterra-slot={slot}
    >
      {/* HTML comment explicitly for Adsterra deployment insertion */}
      <span dangerouslySetInnerHTML={{ __html: slotComment }} />

      <div
        ref={containerRef}
        className="w-full max-w-4xl min-h-[90px] md:min-h-[100px] border border-dashed border-slate-200 bg-slate-50/80 rounded-xl flex flex-col items-center justify-center p-3 text-center transition-colors"
      >
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Advertisement
        </span>
        <p className="text-xs text-slate-400 mt-0.5">
          Reserved Ad Space ({slot.replace('_', ' ')} Banner)
        </p>
      </div>
    </div>
  );
}
