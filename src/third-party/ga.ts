declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function initGA(): void {
  const id = (import.meta as unknown as { env?: Record<string, unknown> })?.env?.[
    'VITE_GA_MEASUREMENT_ID'
  ] as string | undefined;
  if (!id) return;
  // Load the gtag library
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  // Configure GA
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);
}
