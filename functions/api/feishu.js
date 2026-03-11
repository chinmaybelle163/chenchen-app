// functions/api/feishu.js
// Cloudflare Pages Function — proxies all Feishu API calls
// Environment variables needed: FEISHU_APP_ID, FEISHU_APP_SECRET

const FEISHU = 'https://open.feishu.cn/open-apis';
const APP_TOKEN = 'A0Y2bHOfaaFagNsW6iyceceunEb';

const TABLES = {
  milk:   'tbl3st4HuW6bspgP',
  food:   'tbl1FnSmIsGpFqUw',
  poop:   'tbl1fKCeCfNx6eMD',
  sleep:  'tbl7apNYx6pmVjBP',
  water:  'tblwedaKYF0FpUs9',
  status: 'tbl6G7ohsFxoedZ3',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function getToken(appId, appSecret) {
  const res = await fetch(`${FEISHU}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = await res.json();
  if (!data.tenant_access_token) throw new Error('Token fetch failed: ' + JSON.stringify(data));
  return data.tenant_access_token;
}

function authHeaders(token) {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function addRecord(token, tableId, fields) {
  const res = await fetch(`${FEISHU}/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ fields }),
  });
  return res.json();
}

async function getRecords(token, tableId, filter) {
  const params = new URLSearchParams({ page_size: '100' });
  if (filter) params.set('filter', filter);
  const res = await fetch(`${FEISHU}/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

async function updateRecord(token, tableId, recordId, fields) {
  const res = await fetch(`${FEISHU}/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/${recordId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ fields }),
  });
  return res.json();
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { action, table, fields, recordId, filter } = body;

    if (!TABLES[table] && action !== 'get_all') {
      return new Response(JSON.stringify({ error: `Unknown table: ${table}` }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const token = await getToken(env.FEISHU_APP_ID, env.FEISHU_APP_SECRET);
    const tableId = TABLES[table];
    let result;

    if (action === 'add') {
      result = await addRecord(token, tableId, fields);
    } else if (action === 'get') {
      result = await getRecords(token, tableId, filter);
    } else if (action === 'update') {
      result = await updateRecord(token, tableId, recordId, fields);
    } else {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}
