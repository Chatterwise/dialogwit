let bar: HTMLDivElement | null = null;
let timer: number | null = null;

function ensureBar() {
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'top-progress-bar';
  bar.style.position = 'fixed';
  bar.style.left = '0';
  bar.style.top = '0';
  bar.style.height = '3px';
  bar.style.width = '0%';
  bar.style.background = 'linear-gradient(90deg, #2563eb, #7c3aed)';
  bar.style.zIndex = '9999';
  bar.style.transition = 'width 200ms ease-out, opacity 200ms ease-out';
  document.body.appendChild(bar);
  return bar;
}

export function start() {
  const el = ensureBar();
  el.style.opacity = '1';
  el.style.width = '20%';
  if (timer) window.clearInterval(timer);
  timer = window.setInterval(() => {
    const current = parseFloat(el.style.width);
    const next = Math.min(current + Math.random() * 10, 90);
    el.style.width = `${next}%`;
  }, 400) as unknown as number;
}

export function done() {
  const el = ensureBar();
  el.style.width = '100%';
  if (timer) window.clearInterval(timer);
  timer = null;
  window.setTimeout(() => {
    el.style.opacity = '0';
    el.style.width = '0%';
  }, 200);
}

