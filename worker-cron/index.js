// worker-cron/index.js
// Cloudflare Worker with Cron Trigger
// Runs every day at 14:00 UTC = 22:00 Beijing time
// Reads all 6 Feishu tables for today and sends summary to Feishu group

const FEISHU = 'https://open.feishu.cn/open-apis';
const APP_TOKEN = 'A0Y2bHOfaaFagNsW6iyceceunEb';
const WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/e35da794-0b02-48fd-ba41-54d8d9a09048';

const TABLES = {
  milk:   'tbl3st4HuW6bspgP',
  food:   'tbl1FnSmIsGpFqUw',
  poop:   'tbl1fKCeCfNx6eMD',
  sleep:  'tbl7apNYx6pmVjBP',
  water:  'tblwedaKYF0FpUs9',
  status: 'tbl6G7ohsFxoedZ3',
};

// ─── Helpers ───────────────────────────────────────────────────

function getBeijingToday() {
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return bjTime.toISOString().split('T')[0];
}

function getBeijingDateStr() {
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return `${bjTime.getUTCMonth() + 1}月${bjTime.getUTCDate()}日`;
}

function minutesToText(mins) {
  if (!mins || mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分钟`;
}

async function getToken(appId, appSecret) {
  const res = await fetch(`${FEISHU}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = await res.json();
  return data.tenant_access_token;
}

async function getTableRecords(token, tableId, filter) {
  const params = new URLSearchParams({ page_size: '100' });
  if (filter) params.set('filter', filter);
  const res = await fetch(`${FEISHU}/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  return (data?.data?.items || []).map(i => i.fields);
}

// ─── Report formatting ─────────────────────────────────────────

function formatMilk(records) {
  if (records.length === 0) return '🍼 喂奶   今天暂无记录';
  const total = records.reduce((s, r) => s + (r['奶量ml'] || 0), 0);
  const lines = records.map(r => `   ${r['喂奶时间'] || '?'}  ${r['奶量ml'] || '?'}ml`).join('\n');
  return `🍼 喂奶   共${records.length}次 · 总计${total}ml\n${lines}`;
}

function formatFood(records) {
  if (records.length === 0) return '🥣 辅食   今天暂无记录';
  const lines = records.map(r => {
    const parts = [r['辅食时间'] || '?', r['食材内容'] || ''];
    if (r['进食量']) parts.push(r['进食量']);
    if (r['宝宝反应'] && r['宝宝反应'] !== '一般') parts.push(`宝宝${r['宝宝反应']}`);
    return '   ' + parts.filter(Boolean).join(' · ');
  }).join('\n');
  return `🥣 辅食   共${records.length}次\n${lines}`;
}

function formatPoop(records) {
  if (records.length === 0) return '💩 便便   今天暂无记录';
  const lines = records.map(r => {
    const parts = [r['排便时间'] || '?'];
    if (r['颜色']) parts.push(r['颜色']);
    if (r['形态']) parts.push(r['形态']);
    return '   ' + parts.join(' · ');
  }).join('\n');
  return `💩 便便   共${records.length}次\n${lines}`;
}

function formatSleep(records) {
  if (records.length === 0) return '😴 睡眠   今天暂无记录';
  const totalMins = records.reduce((s, r) => s + (r['睡眠时长分钟'] || 0), 0);
  const lines = records
    .filter(r => r['睡着时间'])
    .map(r => {
      const dur = r['睡眠时长分钟'] ? minutesToText(r['睡眠时长分钟']) : '睡着中…';
      return `   ${r['睡着时间']} — ${r['醒来时间'] || '…'}  ${dur}`;
    }).join('\n');
  const totalStr = totalMins > 0 ? `共睡 ${minutesToText(totalMins)}` : '';
  return `😴 睡眠   ${totalStr}\n${lines}`;
}

function formatWater(records) {
  if (records.length === 0) return '💧 喝水   今天暂无记录';
  const total = records.reduce((s, r) => s + (r['水量ml'] || 0), 0);
  return `💧 喝水   共${total}ml`;
}

function formatStatus(records) {
  if (records.length === 0) return '🌟 状态   今天暂无记录';
  const r = records[records.length - 1]; // latest
  const parts = [];
  if (r['精神状态']) parts.push(r['精神状态']);
  if (r['体温']) parts.push(`体温${r['体温']}℃`);
  if (r['异常症状']) parts.push(r['异常症状'] !== '无' ? `⚠️ ${r['异常症状']}` : '无异常');
  if (r['今日总体评价']) parts.push(r['今日总体评价']);
  const notes = r['备注'] ? `\n   📝 ${r['备注']}` : '';
  return `🌟 状态   ${parts.join(' · ')}${notes}`;
}

// ─── Main report ───────────────────────────────────────────────

async function sendDailyReport(env) {
  const token = await getToken(env.FEISHU_APP_ID, env.FEISHU_APP_SECRET);
  const today = getBeijingToday();
  const filter = `AND(CurrentValue.[记录日期]="${today}")`;

  const [milk, food, poop, sleep, water, status] = await Promise.all(
    Object.values(TABLES).map(tid => getTableRecords(token, tid, filter))
  );

  const dateStr = getBeijingDateStr();
  const report = [
    `👶 宸宸今日日报 · ${dateStr}`,
    '─────────────────────',
    formatMilk(milk),
    '',
    formatFood(food),
    '',
    formatPoop(poop),
    '',
    formatSleep(sleep),
    '',
    formatWater(water),
    '',
    formatStatus(status),
    '─────────────────────',
    '以上为今日完整记录 ✨',
  ].join('\n');

  await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msg_type: 'text', content: { text: report } }),
  });
}

// ─── Worker entry ──────────────────────────────────────────────

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDailyReport(env));
  },
  // Also allow manual trigger via HTTP GET (for testing)
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/trigger') {
      await sendDailyReport(env);
      return new Response('Report sent ✅', { status: 200 });
    }
    return new Response('Cron Worker running', { status: 200 });
  },
};
