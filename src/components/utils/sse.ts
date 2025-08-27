export type SSEHandlers = {
  onReady?: (threadId?: string | null) => void;
  onDelta?: (textChunk: string) => void;
  onEnd?: (payload?: { thread_id?: string; text?: string }) => void;
};

export async function readSSE(res: Response, handlers: SSEHandlers) {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}${txt ? `: ${txt}` : ""}`);
  }

  const ct = res.headers.get("content-type") || "";
  // Fallback: non-stream JSON
  if (!ct.includes("text/event-stream")) {
    const data = await res.json().catch(() => ({}));
    if (data?.thread_id) handlers.onReady?.(data.thread_id);
    if (typeof data?.text === "string") handlers.onDelta?.(data.text);
    handlers.onEnd?.(data);
    return;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split events on blank line; tolerate CRLF
    let sep: number;
    while ((sep = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + (buffer[sep] === "\r" ? 4 : 2)); // \r\n\r\n vs \n\n

      let event = "message";
      const dataLines: string[] = [];

      for (const lineRaw of rawEvent.split(/\r?\n/)) {
        if (lineRaw.startsWith("event:")) {
          event = lineRaw.slice(6).trim();
        } else if (lineRaw.startsWith("data:")) {
          // Preserve payload exactly; do NOT trim away spaces
          dataLines.push(lineRaw.slice(5));
        }
      }

      const dataStr = dataLines.join("\n");

      if (event === "ready") {
        try {
          const payload = JSON.parse(dataStr || "{}");
          handlers.onReady?.(payload.thread_id ?? null);
        } catch {//
          }
      } else if (event === "delta") {
        try {
          const payload = JSON.parse(dataStr || "{}");
          if (typeof payload.text === "string") handlers.onDelta?.(payload.text);
        } catch {
          //
        }
      } else if (event === "end") {
        let payload: { thread_id?: string; text?: string } | undefined = undefined;
        try {
          payload = JSON.parse(dataStr || "{}");
        } catch {
          //
        }
        handlers.onEnd?.(payload);
      }
    }
  }
}
