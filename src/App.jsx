import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MilkCard from './components/MilkCard';
import FoodCard from './components/FoodCard';
import PoopCard from './components/PoopCard';
import SleepCard from './components/SleepCard';
import WaterCard from './components/WaterCard';
import StatusCard from './components/StatusCard';
import { Toast } from './components/Shared';
import { feishuGet, getToday } from './api';

const TABLES = ['milk', 'food', 'poop', 'sleep', 'water', 'status'];

export default function App() {
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
    <div style={{ minHeight: '100vh', background: '#FDF6F0', paddingBottom: '48px' }}>
      <Header stats={stats} />
      <div style={{ padding: '24px 20px 0' }}>
        <MilkCard onSuccess={handleSuccess} />
        <FoodCard onSuccess={handleSuccess} />
        <PoopCard onSuccess={handleSuccess} />
        <SleepCard onSuccess={handleSuccess} sleepRecords={stats.sleepRecords} onRefresh={loadTodayData} />
        <WaterCard onSuccess={handleSuccess} waterRecords={stats.waterRecords} />
        <StatusCard onSuccess={handleSuccess} />
      </div>
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
