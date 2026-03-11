import { useState, useRef } from 'react';
import { theme } from '../theme';

const QUICK_PROMPTS = [
  { emoji: '🎲', label: '今日随机推荐', msg: '推荐今天适合9个月宝宝的辅食，简洁列出1-2道，每道包括食材和3步做法。' },
  { emoji: '🥩', label: '高蛋白食谱', msg: '推荐1-2道适合9个月宝宝的高蛋白辅食，简洁列出食材和3步做法。' },
  { emoji: '🥦', label: '蔬菜泥食谱', msg: '推荐1-2道适合9个月宝宝的蔬菜泥，简洁列出食材和3步做法。' },
];

const INGREDIENTS = ['胡萝卜','南瓜','土豆','西蓝花','菠菜','山药','红薯','香菇','牛肉','猪肉','虾仁','三文鱼','鳕鱼','鸡肉','蒸蛋','猪肝'];

async function streamCoze(message, onChunk, onDone) {
  const res = await fetch('/api/coze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const json = line.slice(5).trim();
      if (json === '[DONE]') { onDone(); return; }
      try {
        const obj = JSON.parse(json);
        if (obj.event === 'message' && obj.message?.type === 'answer') {
          onChunk(obj.message.content);
        }
        if (obj.event === 'done') { onDone(); return; }
      } catch {}
    }
  }
  onDone();
}

function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <div key={i} style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginTop: i === 0 ? 0 : 16, marginBottom: 4 }}>{line.replace(/\*\*/g, '')}</div>;
    }
    if (line.startsWith('食材：') || line.startsWith('做法：') || line.startsWith('营养：')) {
      const idx = line.indexOf('：');
      const label = line.slice(0, idx);
      const rest = line.slice(idx + 1);
      return <div key={i} style={{ fontSize: 14, color: theme.textSoft, marginBottom: 3 }}>
        <span style={{ color: theme.primary, fontWeight: 600 }}>{label}：</span>{rest}
      </div>;
    }
    if (line === '') return <div key={i} style={{ height: 4 }} />;
    return <div key={i} style={{ fontSize: 15, color: theme.text, marginBottom: 2 }}>{line}</div>;
  });
}

export default function RecipeCard() {
  const [selected, setSelected] = useState([]);
  const [customIngredient, setCustomIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef('');

  const toggleIngredient = (item) => {
    setSelected(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const addCustom = () => {
    const val = customIngredient.trim();
    if (!val) return;
    const items = val.split(/[,，、\s]+/).filter(Boolean);
    setSelected(prev => [...new Set([...prev, ...items])]);
    setCustomIngredient('');
  };

  const startStream = async (msg) => {
    setLoading(true); setResult(''); setError(null);
    resultRef.current = '';
    try {
      await streamCoze(
        msg,
        (chunk) => {
          resultRef.current += chunk;
          setResult(resultRef.current);
          setLoading(false); // 第一个chunk到来时关闭loading
        },
        () => setLoading(false),
      );
    } catch (e) {
      setError('推荐失败，请检查网络后重试 🙏');
      setLoading(false);
    }
  };

  const handleQuick = (msg) => startStream(msg);

  const handleIngredient = () => {
    if (!selected.length) return;
    const msg = `我有这些食材：${selected.join('、')}。推荐1-2道适合9个月宝宝的辅食，简洁列出食材和3步做法。`;
    startStream(msg);
  };

  const reset = () => { setResult(null); setError(null); setSelected([]); setCustomIngredient(''); resultRef.current = ''; };

  return (
    <div style={{ fontFamily: 'Noto Sans SC, sans-serif' }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40 }}>🍽️</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: theme.text, marginTop: 6 }}>今天吃什么？</div>
        <div style={{ fontSize: 14, color: theme.textSoft, marginTop: 4 }}>宸宸 · 9个月辅食推荐</div>
      </div>

      {/* Quick buttons */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 16px rgba(201,167,216,0.18)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.textSoft, marginBottom: 12, letterSpacing: 1 }}>✨ 一键推荐</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p.label} onClick={() => handleQuick(p.msg)}
              style={{ padding: '18px 8px', borderRadius: 16, border: `2px solid ${theme.border}`, background: theme.bg, cursor: 'pointer', textAlign: 'center', fontSize: 13, fontWeight: 700, color: theme.text, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.background = '#F9F0FC'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bg; }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{p.emoji}</div>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient selector */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: '0 2px 16px rgba(201,167,216,0.18)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.textSoft, marginBottom: 4, letterSpacing: 1 }}>🥕 根据食材推荐</div>
        <div style={{ fontSize: 13, color: theme.textSoft, marginBottom: 14 }}>选今天有什么，AI帮你搭配</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {INGREDIENTS.map(item => {
            const on = selected.includes(item);
            return (
              <button key={item} onClick={() => toggleIngredient(item)} style={{
                padding: '8px 14px', borderRadius: 20,
                border: `2px solid ${on ? theme.primary : theme.border}`,
                background: on ? '#F3E8FC' : theme.bg,
                color: on ? theme.primary : theme.textSoft,
                fontWeight: on ? 700 : 400, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
              }}>{item}</button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={customIngredient}
            onChange={e => setCustomIngredient(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="其他食材，如：豆腐、玉米..."
            style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${theme.border}`, background: theme.bg, fontSize: 14, color: theme.text, outline: 'none', fontFamily: 'Noto Sans SC, sans-serif' }}
          />
          <button onClick={addCustom} style={{ padding: '12px 16px', borderRadius: 12, border: 'none', background: theme.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>添加</button>
        </div>
        <button onClick={handleIngredient} disabled={!selected.length}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: selected.length ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` : theme.border,
            color: selected.length ? '#fff' : theme.textSoft,
            fontSize: 16, fontWeight: 700, cursor: selected.length ? 'pointer' : 'default', transition: 'all 0.2s',
          }}>
          {selected.length ? `用 ${selected.slice(0, 3).join('、')}${selected.length > 3 ? '等' : ''}推荐食谱 ✨` : '请先选择食材'}
        </button>
      </div>

      {/* Loading spinner - only before first chunk */}
      {loading && !result && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 36, textAlign: 'center', boxShadow: '0 2px 16px rgba(201,167,216,0.18)' }}>
          <div style={{ fontSize: 36, display: 'inline-block', animation: 'spin 1s linear infinite' }}>🍳</div>
          <div style={{ fontSize: 15, color: theme.textSoft, marginTop: 14, fontWeight: 500 }}>AI 正在帮宸宸想食谱...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#FFF0F0', borderRadius: 20, padding: 20, textAlign: 'center', color: '#E74C3C', fontSize: 15 }}>
          {error}
          <button onClick={reset} style={{ display: 'block', margin: '12px auto 0', padding: '8px 20px', borderRadius: 10, border: '1.5px solid #E74C3C', background: 'transparent', color: '#E74C3C', cursor: 'pointer' }}>重试</button>
        </div>
      )}

      {/* Streaming result */}
      {result !== null && !error && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 16px rgba(201,167,216,0.18)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: theme.primary }}>🤖 AI 食谱推荐</div>
            <button onClick={reset} style={{ padding: '6px 14px', borderRadius: 10, border: `1.5px solid ${theme.border}`, background: 'transparent', color: theme.textSoft, fontSize: 13, cursor: 'pointer' }}>重新选择</button>
          </div>
          <div style={{ lineHeight: 1.9 }}>
            {renderMarkdown(result)}
            {loading && <span style={{ animation: 'blink 1s infinite', color: theme.primary }}>▍</span>}
          </div>
        </div>
      )}
    </div>
  );
}
