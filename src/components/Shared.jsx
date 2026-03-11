import { useState } from 'react';
import { theme } from '../theme';

export const TagButton = ({ label, selected, onToggle }) => (
  <button onClick={onToggle} style={{
    padding: '12px 18px', borderRadius: '50px',
    border: selected ? `2px solid ${theme.primary}` : `2px solid ${theme.border}`,
    background: selected ? theme.primaryLight : theme.card,
    color: selected ? theme.primaryDark : theme.textSoft,
    fontSize: '16px', fontWeight: selected ? '700' : '500',
    cursor: 'pointer',
  }}>{label}</button>
);

export const OptionRow = ({ options, selected, onSelect, colorMap }) => (
  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
    {options.map(opt => (
      <button key={opt} onClick={() => onSelect(selected === opt ? null : opt)} style={{
        flex: 1, minWidth: '70px', padding: '14px 8px',
        borderRadius: '14px', textAlign: 'center',
        border: selected === opt ? `2px solid ${colorMap?.[opt] || theme.primary}` : `2px solid ${theme.border}`,
        background: selected === opt ? (colorMap?.[opt] ? colorMap[opt] + '22' : theme.primaryLight) : theme.bg,
        color: selected === opt ? (colorMap?.[opt] || theme.primaryDark) : theme.textSoft,
        fontSize: '16px', fontWeight: selected === opt ? '700' : '500',
        cursor: 'pointer',
      }}>{opt}</button>
    ))}
  </div>
);

export const CounterBtn = ({ value, onChange, step = 10, min = 0, max = 999, unit }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <button onClick={() => onChange(Math.max(min, value - step))} style={{
      width: '52px', height: '52px', borderRadius: '50%',
      background: theme.primaryLight, border: 'none',
      fontSize: '26px', color: theme.primaryDark, cursor: 'pointer', fontWeight: 'bold',
    }}>−</button>
    <div style={{ minWidth: '100px', textAlign: 'center', fontSize: '32px', fontWeight: '900', color: theme.text }}>
      {value}<span style={{ fontSize: '16px', color: theme.textSoft, marginLeft: '4px' }}>{unit}</span>
    </div>
    <button onClick={() => onChange(Math.min(max, value + step))} style={{
      width: '52px', height: '52px', borderRadius: '50%',
      background: theme.primaryLight, border: 'none',
      fontSize: '26px', color: theme.primaryDark, cursor: 'pointer', fontWeight: 'bold',
    }}>+</button>
  </div>
);

export const SectionLabel = ({ children }) => (
  <div style={{ fontSize: '15px', color: theme.textSoft, marginBottom: '12px', marginTop: '18px' }}>
    {children}
  </div>
);

export const NoteInput = ({ value, onChange, placeholder = '备注（选填）' }) => (
  <div style={{ marginTop: '16px' }}>
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={2}
      style={{
        width: '100%', padding: '14px 16px',
        border: `1.5px solid ${theme.border}`, borderRadius: '14px',
        fontSize: '16px', color: theme.text, background: theme.bg,
        outline: 'none', resize: 'none', boxSizing: 'border-box',
      }}
    />
  </div>
);

export const SubmitBtn = ({ onSubmit, loading }) => (
  <button onClick={onSubmit} disabled={loading} style={{
    width: '100%', padding: '18px',
    background: loading ? '#ccc' : `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
    border: 'none', borderRadius: '16px',
    color: 'white', fontSize: '18px', fontWeight: '700',
    cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px',
    boxShadow: loading ? 'none' : '0 6px 20px rgba(201,167,216,0.45)',
    letterSpacing: '2px',
  }}>{loading ? '提交中...' : '✓ 记录完成'}</button>
);

export const Toast = ({ msg, type }) => {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
      background: type === 'error' ? '#E74C3C' : '#1E8449',
      color: 'white', padding: '14px 28px', borderRadius: '50px',
      fontSize: '16px', fontWeight: '600', zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}>{type === 'error' ? '❌ ' : '✅ '}{msg}</div>
  );
};

export const Card = ({ emoji, title, accent, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: theme.card, borderRadius: '24px',
      border: `1.5px solid ${theme.border}`, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(180,130,210,0.08)', marginBottom: '16px',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', background: 'none', border: 'none',
        padding: '22px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '18px',
            background: accent || theme.primaryLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
          }}>{emoji}</div>
          <span style={{ fontSize: '22px', fontWeight: '700', color: theme.text }}>{title}</span>
        </div>
        <span style={{ fontSize: '22px', color: theme.textLight, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding: '4px 24px 24px', borderTop: `1px solid ${theme.border}` }}>
          {children}
        </div>
      )}
    </div>
  );
};
