import { theme } from '../theme';

export default function Header({ stats }) {
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const month = bjTime.getUTCMonth() + 1;
  const day = bjTime.getUTCDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const week = weekDays[bjTime.getUTCDay()];

  const totalMilk = stats.milkRecords.reduce((s, r) => s + (Number(r['奶量ml']) || 0), 0);
  const milkCount = stats.milkRecords.length;
  const foodCount = stats.foodRecords.length;
  const poopCount = stats.poopRecords.length;
  const waterTotal = stats.waterRecords.reduce((s, r) => s + (Number(r['水量ml']) || 0), 0);
  const sleepMins = stats.sleepRecords.reduce((s, r) => s + (Number(r['睡眠时长分钟']) || 0), 0);
  const sleepH = sleepMins > 0 ? (sleepMins / 60).toFixed(1) + 'h' : '—';

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary}, ${theme.accent})`,
      padding: '36px 28px 30px',
      borderBottomLeftRadius: '36px', borderBottomRightRadius: '36px',
      boxShadow: '0 8px 32px rgba(155,114,176,0.3)',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', marginBottom: '6px' }}>
        {month}月{day}日 {week}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'white', fontSize: '34px', fontWeight: '900', letterSpacing: '1px' }}>宸宸管家 👶</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', marginTop: '4px' }}>9个月 · 今天记录中</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)', borderRadius: '20px',
          padding: '14px 20px', textAlign: 'center', backdropFilter: 'blur(10px)',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>今日奶量</div>
          <div style={{ color: 'white', fontSize: '26px', fontWeight: '900' }}>
            {totalMilk}<span style={{ fontSize: '14px' }}>ml</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '20px' }}>
        {[
          ['🍼', '喂奶', milkCount ? `${milkCount}次` : '—'],
          ['🥣', '辅食', foodCount ? `${foodCount}次` : '—'],
          ['💩', '便便', poopCount ? `${poopCount}次` : '—'],
          ['😴', '睡眠', sleepH],
          ['💧', '喝水', waterTotal ? `${waterTotal}ml` : '—'],
        ].map(([ic, lb, val]) => (
          <div key={lb} style={{
            background: 'rgba(255,255,255,0.18)', borderRadius: '14px',
            padding: '10px 4px', textAlign: 'center', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: '18px' }}>{ic}</div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>{val}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{lb}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
