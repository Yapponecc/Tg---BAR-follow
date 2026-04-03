const leftEl = document.getElementById("leftCount");
const goalEl = document.getElementById("goalCount");
const fillEl = document.getElementById("barFill");
const titleEl = document.getElementById("titleText");

const p = new URLSearchParams(window.location.search);
const goal = Number(p.get("goal") || 1000);
const pollMs = Math.max(5000, Number(p.get("poll") || 15000));
const title = p.get("title") || "TELEGRAM SUBS ❤";

const fmt = (n) => new Intl.NumberFormat("ru-RU").format(n);

goalEl.textContent = fmt(goal);
titleEl.textContent = title;

function render(count){
  leftEl.textContent = fmt(count);
  const pct = Math.max(0, Math.min(100, (count / goal) * 100));
  fillEl.style.width = `${pct}%`;
}

async function tick() {
  try {
    const r = await fetch(`/api/subscribers?t=${Date.now()}`);
    const d = await r.json();
    if (!d.ok) return;
    let prevPct = -1;

function render(count){
  leftEl.textContent = fmt(count);
  const pct = Math.max(0, Math.min(100, (count / goal) * 100));
  fillEl.style.width = `${pct}%`;

  if (pct > prevPct && prevPct >= 0) {
    fillEl.classList.remove("active");
    void fillEl.offsetWidth;
    fillEl.classList.add("active");
  }
  prevPct = pct;
}

  } catch {}
}

tick();
setInterval(tick, pollMs);
