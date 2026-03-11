import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MilkCard from './components/MilkCard';
import FoodCard from './components/FoodCard';
import PoopCard from './components/PoopCard';
import SleepCard from './components/SleepCard';
import WaterCard from './components/WaterCard';
import StatusCard from './components/StatusCard';
import RecipeCard from './components/RecipeCard';
import { Toast } from './components/Shared';
import { feishuGet, getToday } from './api';

const TABLES = ['milk', 'food', 'poop', 'sleep', 'water', 'status'];

const NAV = [
  { key: 'record', emoji: '📋', label: '记录' },
  { key: 'recipe', emoji: '🍽️', label: '食谱' },
];

export default function App() {
  const [tab, setTab] = useState('record');
  const [stats, setStats] = useState({
    milkRecords: [], foodRecords: [], poopRecords: [],
    sleepRecords: [], waterRecords: [], statusRecords: [],
  });
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 2500);
  }, []);

  const loadTodayData = useCallback(async () => {
    const today = getToday();
    const filter = `AND(CurrentValue.[记录日期]="${today}")`;
    const results = await Promise.allSettled(
      TABLES.map(t => feishuGet(t, filter))
    );
    const [milk, food, poop, sleep, water, status] = results.map(r =>
      r.status === 'fulfilled' ? (r.value?.data?.items || []).map(i => i.fields) : []
    );
    setStats({
      milkRecords: milk, foodRecords: food, poopRecords: poop,
      sleepRecords: sleep, waterRecords: water, statusRecords: status,
    });
  }, []);

  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  const handleSuccess = (msg, type = 'success') => {
    showToast(msg, type);
    if (type !== 'error') loadTodayData();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6F0', paddingBottom: '80px' }}>

      {/* 页面内容 */}
      {tab === 'record' && (
        <>
          <Header stats={stats} />
          <div style={{ padding: '24px 20px 0' }}>
            <MilkCard onSuccess={handleSuccess} />
            <FoodCard onSuccess={handleSuccess} />
            <PoopCard onSuccess={handleSuccess} />
            <SleepCard onSuccess={handleSuccess} sleepRecords={stats.sleepRecords} onRefresh={loadTodayData} />
            <WaterCard onSuccess={handleSuccess} waterRecords={stats.waterRecords} />
            <StatusCard onSuccess={handleSuccess} />
          </div>
        </>
      )}

      {tab === 'recipe' && (
        <div style={{ padding: '24px 20px 0' }}>
          <RecipeCard />
        </div>
      )}

      {/* 底部导航栏 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderTop: '1.5px solid #EDE0ED',
        display: 'flex',
        boxShadow: '0 -4px 20px rgba(201,167,216,0.15)',
        zIndex: 100,
      }}>
        {NAV.map(n => {
          const active = tab === n.key;
          return (
            <button key={n.key} onClick={() => setTab(n.key)} style={{
              flex: 1, padding: '12px 0 10px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}>
              <div style={{ fontSize: 22 }}>{n.emoji}</div>
              <div style={{
                fontSize: 12, fontWeight: active ? 700 : 400,
                color: active ? '#C9A7D8' : '#9E8A9E',
                fontFamily: 'Noto Sans SC, sans-serif',
              }}>{n.label}</div>
              {active && (
                <div style={{
                  position: 'absolute', bottom: 0,
                  width: 32, height: 3, borderRadius: 2,
                  background: '#C9A7D8',
                }} />
              )}
            </button>
          );
        })}
      </div>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
