import { useState } from 'react';
import { Card, OptionRow, SectionLabel, SubmitBtn } from './Shared';
import { theme } from '../theme';
import { feishuAdd, getToday } from '../api';

export default function StatusCard({ onSuccess }) {
  const [mood, setMood] = useState(null);
  const [tempNormal, setTempNormal] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [symptom, setSymptom] = useState(null);
  const [eval_, setEval] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const tempNum = tempNormal === true ? 36.5 : (parseFloat(tempValue) || null);
      await feishuAdd('status', {
        记录日期: getToday(),
        ...(mood ? { 精神状态: mood.replace(/.*? /, '') } : {}),
        ...(tempNum ? { 体温: tempNum } : {}),
        ...(symptom ? { 异常症状: symptom } : {}),
        ...(eval_ ? { 今日总体评价: eval_.replace(/.*? /, '') } : {}),
        ...(note ? { 备注: note } : {}),
      });
      setMood(null); setTempNormal(null); setTempValue(''); setSymptom(null); setEval(null); setNote('');
      onSuccess('今日状态记录成功 🌟');
    } catch (e) {
      onSuccess('提交失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card emoji="🌟" title="今日状态" accent="#FFF0F8">
      <SectionLabel>精神状态</SectionLabel>
      <OptionRow
        options={['😊 活泼', '😐 一般', '😢 偏差']}
        selected={mood} onSelect={setMood}
        colorMap={{ '😊 活泼': '#52BE80', '😐 一般': '#F5A623', '😢 偏差': '#E74C3C' }}
      />

      <SectionLabel>体温</SectionLabel>
      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          { val: true, label: '🌡️ 正常', border: '#52BE80', bg: '#E8F7EE', color: '#1E8449' },
          { val: false, label: '🔴 不正常', border: '#E74C3C', bg: '#FDEAEA', color: '#C0392B' },
        ].map(btn => (
          <button key={String(btn.val)} onClick={() => setTempNormal(tempNormal === btn.val ? null : btn.val)} style={{
            flex: 1, padding: '18px', borderRadius: '14px',
            border: tempNormal === btn.val ? `2px solid ${btn.border}` : `2px solid ${theme.border}`,
            background: tempNormal === btn.val ? btn.bg : theme.bg,
            fontSize: '17px', fontWeight: '700',
            color: tempNormal === btn.val ? btn.color : theme.textSoft,
            cursor: 'pointer',
          }}>{btn.label}</button>
        ))}
      </div>
      {tempNormal === false && (
        <input
          placeholder="请输入体温，如 38.2"
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          type="number" step="0.1"
          style={{
            width: '100%', marginTop: '12px', padding: '14px 16px',
            border: `1.5px solid #E74C3C`, borderRadius: '12px',
            fontSize: '17px', color: theme.text, background: theme.bg,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      )}

      <SectionLabel>异常症状</SectionLabel>
      <OptionRow
        options={['无', '发烧', '咳嗽', '腹泻', '呕吐', '皮疹']}
        selected={symptom} onSelect={setSymptom}
        colorMap={{ '无': '#52BE80', '发烧': '#E74C3C', '咳嗽': '#E67E22', '腹泻': '#8E44AD', '呕吐': '#C0392B', '皮疹': '#D35400' }}
      />

      <SectionLabel>今日总体评价</SectionLabel>
      <OptionRow
        options={['良好 👍', '需关注 ⚠️']}
        selected={eval_} onSelect={setEval}
        colorMap={{ '良好 👍': '#52BE80', '需关注 ⚠️': '#E67E22' }}
      />

      <div style={{ marginTop: '18px' }}>
        <div style={{ fontSize: '15px', color: theme.textSoft, marginBottom: '8px' }}>玩耍活动 / 备注</div>
        <textarea
          value={note} onChange={e => setNote(e.target.value)}
          placeholder="今天做了什么，有什么特别情况..." rows={2}
          style={{
            width: '100%', padding: '14px 16px',
            border: `1.5px solid ${theme.border}`, borderRadius: '14px',
            fontSize: '16px', color: theme.text, background: theme.bg,
            outline: 'none', resize: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
      <SubmitBtn onSubmit={handleSubmit} loading={loading} />
    </Card>
  );
}
