import { useState, useEffect } from 'react';
import { Card, SectionLabel } from './Shared';
import { theme } from '../theme';
import { feishuAdd, feishuGet, feishuUpdate, getToday, getNowTime, minutesToDuration, timeDiffMinutes } from '../api';

export default function SleepCard({ onSuccess, sleepRecords, onRefresh }) {
  const [activeSleepId, setActiveSleepId] = useState(null); // record_id of ongoing sleep
  const [activeStart, setActiveStart] = useState(null);
  const [loading, setLoading] = useState(false);

  // On mount, check if there's an active (incomplete) sleep record today
  useEffect(() => {
    const findActive = async () => {
      try {
        const filter = `AND(CurrentValue.[记录日期]="${getToday()}")`;
        const data = await feishuGet('sleep', filter);
        const items = data?.data?.items || [];
        const open = items.find(r => r.fields['睡着时间'] && !r.fields['醒来时间']);
        if (open) {
          setActiveSleepId(open.record_id);
          setActiveStart(open.fields['睡着时间']);
        }
      } catch (_) {}
    };
    findActive();
  }, []);

  const handleSleep = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const startTime = getNowTime();
      const res = await feishuAdd('sleep', {
        记录日期: getToday(),
        睡着时间: startTime,
      });
      const recordId = res?.data?.record?.record_id;
      setActiveSleepId(recordId);
      setActiveStart(startTime);
      onSuccess('宸宸睡着啦 😴');
    } catch (e) {
      onSuccess('提交失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWake = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const endTime = getNowTime();
      const mins = activeStart ? timeDiffMinutes(activeStart, endTime) : 0;

      if (activeSleepId) {
        await feishuUpdate('sleep', activeSleepId, {
          醒来时间: endTime,
          睡眠时长分钟: mins,
        });
      } else {
        // No active record found, just create a standalone wake record
        await feishuAdd('sleep', {
          记录日期: getToday(),
          醒来时间: endTime,
        });
      }
      setActiveSleepId(null);
      setActiveStart(null);
      onSuccess('宸宸醒来啦 ☀️');
      onRefresh();
    } catch (e) {
      onSuccess('提交失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSleeping = !!activeSleepId;

  return (
    <Card emoji="😴" title="睡眠" accent="#EDE0FF">
      {isSleeping && (
        <div style={{
          background: theme.primaryLight, borderRadius: '14px',
          padding: '12px 16px', marginTop: '12px', marginBottom: '4px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '20px' }}>😴</span>
          <span style={{ color: theme.primaryDark, fontWeight: '700', fontSize: '15px' }}>
            睡着中… 从 {activeStart} 开始
          </span>
        </div>
      )}

      <SectionLabel>操作</SectionLabel>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={handleSleep} disabled={isSleeping || loading} style={{
          flex: 1, padding: '22px 8px', borderRadius: '18px',
          border: isSleeping ? `2px solid ${theme.primaryDark}` : `2px solid ${theme.border}`,
          background: isSleeping ? theme.primaryLight : theme.bg,
          fontSize: '18px', fontWeight: '700',
          color: isSleeping ? theme.primaryDark : theme.textSoft,
          cursor: isSleeping ? 'not-allowed' : 'pointer', opacity: isSleeping ? 0.7 : 1,
        }}>😴<br /><span style={{ fontSize: '17px' }}>睡着了</span></button>

        <button onClick={handleWake} disabled={!isSleeping || loading} style={{
          flex: 1, padding: '22px 8px', borderRadius: '18px',
          border: !isSleeping ? `2px solid ${theme.border}` : `2px solid #F5A723`,
          background: !isSleeping ? theme.bg : '#FFF8E7',
          fontSize: '18px', fontWeight: '700',
          color: !isSleeping ? theme.textSoft : '#D4870A',
          cursor: !isSleeping ? 'not-allowed' : 'pointer', opacity: !isSleeping ? 0.5 : 1,
        }}>☀️<br /><span style={{ fontSize: '17px' }}>醒来了</span></button>
      </div>

      {sleepRecords.length > 0 && (
        <div style={{ background: theme.bg, borderRadius: '14px', padding: '14px 16px', marginTop: '18px' }}>
          <div style={{ fontSize: '13px', color: theme.textSoft, marginBottom: '10px' }}>今日睡眠记录</div>
          {sleepRecords.map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0',
              borderBottom: i < sleepRecords.length - 1 ? `1px solid ${theme.border}` : 'none',
            }}>
              <span style={{ color: theme.text, fontSize: '15px' }}>
                {r['睡着时间'] || '?'} — {r['醒来时间'] || '…'}
              </span>
              {r['睡眠时长分钟'] > 0 && (
                <span style={{
                  background: theme.successLight, color: theme.successText,
                  borderRadius: '8px', padding: '3px 12px', fontSize: '14px', fontWeight: '600',
                }}>{minutesToDuration(r['睡眠时长分钟'])}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
