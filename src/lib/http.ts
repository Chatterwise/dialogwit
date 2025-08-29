import { useToast } from "./toastStore";

export type HttpError = {
  status: number;
  message: string;
  url: string;
  body?: unknown;
};

type FetchOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
};

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function fetchWithRetry(
  url: string,
  opts: FetchOptions = {}
): Promise<Response> {
  const { timeoutMs = 15000, retries = 1, retryDelayMs = 400, signal, ...rest } = opts;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Merge signals if caller provided one
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...rest, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err: HttpError = {
          status: res.status,
          message: text || `HTTP ${res.status}`,
          url,
        };
        throw err;
      }
      return res;
    } catch (err) {
      lastErr = err;
      // Only retry on network errors or 5xx
      const status = (err as HttpError)?.status;
      const canRetry = attempt < retries && (status === undefined || (status >= 500 && status < 600));
      if (!canRetry) break;
      await sleep(retryDelayMs * (attempt + 1));
    }
  }
  throw lastErr;
}

export async function fetchJson<T = unknown>(
  url: string,
  opts: FetchOptions = {}
): Promise<T> {
  const res = await fetchWithRetry(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  return (await res.json()) as T;
}

// SSE helper: ensures Accept header and validates content-type is event-stream
export async function fetchEventStream(
  url: string,
  opts: FetchOptions = {}
): Promise<Response> {
  const headers = { Accept: "text/event-stream", ...(opts.headers || {}) } as Record<string, string>;
  const res = await fetchWithRetry(url, { ...opts, headers });
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text/event-stream")) {
    const err: HttpError = {
      status: res.status,
      message: `Unexpected content-type: ${ct || "unknown"}`,
      url,
    };
    throw err;
  }
  return res;
}

// Convenience hook: perform a fetch and toast errors
export function useHttp() {
  const toast = useToast();
  return {
    fetchJson: async <T = unknown>(url: string, opts?: FetchOptions) => {
      try {
        return await fetchJson<T>(url, opts);
      } catch (e) {
        const msg = (e as { message?: string })?.message || "Network error";
        toast.error(msg);
        throw e;
      }
    },
  };
}
