const API = '/api/feishu';

async function call(body) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const feishuAdd = (table, fields) => call({ action: 'add', table, fields });
export const feishuGet = (table, filter) => call({ action: 'get', table, filter });
export const feishuUpdate = (table, recordId, fields) => call({ action: 'update', table, recordId, fields });

export function getToday() {
  // Beijing time (UTC+8)
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return bjTime.toISOString().split('T')[0];
}

export function getNowTime() {
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const h = String(bjTime.getUTCHours()).padStart(2, '0');
  const m = String(bjTime.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function minutesToDuration(mins) {
  if (!mins) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}h${m}m`;
}

export function timeDiffMinutes(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60; // overnight
  return diff;
}
