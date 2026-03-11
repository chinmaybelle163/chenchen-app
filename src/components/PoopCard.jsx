import { useState } from 'react';
import { Card, OptionRow, SectionLabel, NoteInput, SubmitBtn } from './Shared';
import { theme } from '../theme';
import { feishuAdd, getToday, getNowTime } from '../api';

const COLORS = [
  { label: '金黄色', hex: '#F4C430' },
  { label: '绿色', hex: '#52BE80' },
  { label: '棕色', hex: '#784212' },
];

export default function PoopCard({ onSuccess }) {
  const [color, setColor] = useState(null);
  const [shape, setShape] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await feishuAdd('poop', {
        记录日期: getToday(),
        排便时间: getNowTime(),
        ...(color ? { 颜色: color } : {}),
        ...(shape ? { 形态: shape } : {}),
        ...(note ? { 备注: note } : {}),
      });
      setColor(null); setShape(null); setNote('');
      onSuccess('便便记录成功 💩');
    } catch (e) {
      onSuccess('提交失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card emoji="💩" title="便便" accent="#FFF8E1">
      <SectionLabel>颜色</SectionLabel>
      <div style={{ display: 'flex', gap: '12px' }}>
        {COLORS.map(c => (
          <button key={c.label} onClick={() => setColor(color === c.label ? null : c.label)} style={{
            flex: 1, padding: '18px 8px', borderRadius: '16px',
            border: color === c.label ? `3px solid ${c.hex}` : `2px solid ${theme.border}`,
            background: color === c.label ? c.hex + '33' : theme.bg,
            cursor: 'pointer',
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: c.hex, margin: '0 auto 10px' }} />
            <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text }}>{c.label}</div>
          </button>
        ))}
      </div>

      <SectionLabel>形态</SectionLabel>
      <OptionRow options={['正常', '稀便', '偏干']} selected={shape} onSelect={setShape} />

      <NoteInput value={note} onChange={setNote} />
      <SubmitBtn onSubmit={handleSubmit} loading={loading} />
    </Card>
  );
}
