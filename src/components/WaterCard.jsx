import { useState } from 'react';
import { Card, TagButton, CounterBtn, SectionLabel, SubmitBtn } from './Shared';
import { feishuAdd, getToday, getNowTime } from '../api';

export default function WaterCard({ onSuccess, waterRecords }) {
  const [ml, setMl] = useState(50);
  const [loading, setLoading] = useState(false);

  const todayTotal = waterRecords.reduce((s, r) => s + (Number(r['水量ml']) || 0), 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await feishuAdd('water', {
        记录日期: getToday(),
        喝水时间: getNowTime(),
        水量ml: ml,
        今日累计ml: todayTotal + ml,
      });
      onSuccess('喝水记录成功 💧');
    } catch (e) {
      onSuccess('提交失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card emoji="💧" title="喝水" accent="#E0F4FF">
      {todayTotal > 0 && (
        <div style={{ fontSize: '15px', color: '#2E86C1', fontWeight: '700', marginTop: '12px' }}>
          今日已喝 {todayTotal}ml 💧
        </div>
      )}
      <SectionLabel>喝了多少？</SectionLabel>
      <CounterBtn value={ml} onChange={setMl} step={10} min={10} max={300} unit="ml" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
        {[30, 50, 80, 100].map(v => (
          <TagButton key={v} label={`${v}ml`} selected={ml === v} onToggle={() => setMl(v)} />
        ))}
      </div>
      <SubmitBtn onSubmit={handleSubmit} loading={loading} />
    </Card>
  );
}
