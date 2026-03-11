import { useState } from 'react';
import { Card, TagButton, CounterBtn, SectionLabel, NoteInput, SubmitBtn } from './Shared';
import { feishuAdd, getToday, getNowTime } from '../api';

export default function MilkCard({ onSuccess }) {
  const [ml, setMl] = useState(150);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await feishuAdd('milk', {
        记录日期: getToday(),
        喂奶时间: getNowTime(),
        奶量ml: ml,
        ...(note ? { 备注: note } : {}),
      });
      setNote('');
      onSuccess('喂奶记录成功 🍼');
    } catch (e) {
      onSuccess('提交失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card emoji="🍼" title="喂奶" accent="#FDE4EF" defaultOpen={true}>
      <SectionLabel>奶粉量</SectionLabel>
      <CounterBtn value={ml} onChange={setMl} step={10} min={50} max={350} unit="ml" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
        {[100, 120, 150, 180, 200].map(v => (
          <TagButton key={v} label={`${v}ml`} selected={ml === v} onToggle={() => setMl(v)} />
        ))}
      </div>
      <NoteInput value={note} onChange={setNote} />
      <SubmitBtn onSubmit={handleSubmit} loading={loading} />
    </Card>
  );
}
