export type ConsentState = 'accepted' | 'rejected' | null;

const CONSENT_KEY = 'cw_cookie_consent';
const CONSENT_EVENT = 'cw_consent_change';

export function getConsent(): ConsentState {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === 'accepted' || v === 'rejected') return v;
    return null;
  } catch {
    return null;
  }
}

export function setConsent(state: Exclude<ConsentState, null>): void {
  try {
    localStorage.setItem(CONSENT_KEY, state);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  } catch {
    // ignore storage errors
  }
}

export function onConsentChange(callback: (state: ConsentState) => void): () => void {
  const handler = (e: Event) => {
    const ce = e as CustomEvent<ConsentState>;
    callback(ce.detail ?? getConsent());
  };
  window.addEventListener(CONSENT_EVENT, handler);
  // also listen to storage changes (other tabs)
  const storageHandler = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY) callback(getConsent());
  };
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(CONSENT_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

export function shouldCaptureAnalytics(): boolean {
  return getConsent() === 'accepted';
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
  } catch {
    // ignore
  }
}


