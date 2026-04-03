const countEl=document.getElementById("count"); const barEl=document.getElementById("barFill"); const metaEl=document.getElementById("meta"); const labelEl=document.getElementById("label");
const p=new URLSearchParams(window.location.search); const goal=Number(p.get("goal")||10000); const pollMs=Math.max(5000,Number(p.get("poll")||15000)); const label=p.get("label")||"Telegram"; labelEl.textContent=label;
const fmt=n=>new Intl.NumberFormat("ru-RU").format(n); const ts=ms=>new Date(ms).toLocaleTimeString();
function setCount(v){ countEl.textContent=fmt(v); const pct=Math.max(0,Math.min(100,(v/goal)*100)); barEl.style.width=`${pct.toFixed(2)}%`; }
async function update(){ try{ const r=await fetch(`/api/subscribers?t=${Date.now()}`); const d=await r.json(); if(!d.ok) throw new Error(d.error||"API error"); setCount(d.count); metaEl.textContent=`updated ${ts(d.updatedAt)} · goal ${fmt(goal)}`; }catch(e){ metaEl.textContent=`error: ${String(e.message||e)}`; } }
update(); setInterval(update,pollMs);
