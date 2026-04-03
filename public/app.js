const leftEl = document.getElementById("leftCount");
const goalEl = document.getElementById("goalCount");
const fillEl = document.getElementById("barFill");
const metaEl = document.getElementById("meta");
const titleEl = document.getElementById("titleText");

const p = new URLSearchParams(window.location.search);
const goal = Number(p.get("goal") || 1000);
const pollMs = Math.max(5000, Number(p.get("poll") || 15000));
const title = p.get("title") || "TELEGRAM SUBS ❤";

titleEl.textContent = title;
goalEl.textContent = new Intl.NumberFormat("ru-RU").format(goal);

const fmt = (n) => new Intl.NumberFormat("ru-RU").format(n);
const ts = (ms) => new Date(ms).toLocaleTimeString();

function render(count, updatedAt) {
  leftEl.textContent = fmt(count);
  const pct = Math.max(0, Math.min(100, (count / goal) * 100));
  fillEl.style.width = `${pct}%`;
  metaEl.textContent = `updated ${ts(updatedAt)} · goal ${fmt(goal)}`;
}

async function tick() {
  try {
    const r = await fetch(`/api/subscribers?t=${Date.now()}`);
    const d = await r.json();
    if (!d.ok) throw new Error(d.error || "API error");
    render(Number(d.count || 0), d.updatedAt || Date.now());
  } catch (e) {
    metaEl.textContent = `error: ${String(e.message || e)}`;
  }
}

tick();
setInterval(tick, pollMs);
