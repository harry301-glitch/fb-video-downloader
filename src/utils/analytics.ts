/**
 * Clean Google Analytics 4 (GA4) Event Dispatcher
 * Tracks essential non-PII operational events.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function initGA() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId || typeof window === 'undefined') return;

  // Check if script already injected
  if (document.getElementById('ga-script')) return;

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: true
  });
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export function trackDownloadAttempt(domain: string) {
  trackEvent('download_attempt', {
    source_domain: domain,
    timestamp: Date.now()
  });
}

export function trackDownloadSuccess(quality: string, format: string) {
  trackEvent('download_success', {
    quality,
    format,
    timestamp: Date.now()
  });
}

export function trackDownloadError(errorCode: string) {
  trackEvent('download_error', {
    error_type: errorCode,
    timestamp: Date.now()
  });
}

export function trackQualitySelected(quality: string) {
  trackEvent('quality_selected', {
    quality,
    timestamp: Date.now()
  });
}
