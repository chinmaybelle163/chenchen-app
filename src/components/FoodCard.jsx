import { useState } from 'react';
import { Card, TagButton, OptionRow, SectionLabel, NoteInput, SubmitBtn } from './Shared';
import { feishuAdd, getToday, getNowTime } from '../api';

const FOOD_TAGS = [
  '米粥', '小米粥', '面条', '烩饭', '软米饭',
  '牛肉', '猪肉/肉沫', '虾仁', '三文鱼', '鳕鱼', '蒸蛋', '鸡肉', '猪肝', '排骨',
  '胡萝卜', '西蓝花', '南瓜', '山药', '红薯', '香菇', '土豆', '菠菜',
];

export default function FoodCard({ onSuccess }) {
  const [foods, setFoods] = useState([]);
  const [amount, setAmount] = useState(null);
  const [reaction, setReaction] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleFood = (tag) =>
    setFoods(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);

  const handleSubmit = async () => {
    if (foods.length === 0) { onSuccess('请至少选择一种食材', 'error'); return; }
    setLoading(true);
    try {
      await feishuAdd('food', {
        记录日期: getToday(),
        辅食时间: getNowTime(),
        食材内容: foods.join('、'),
        ...(amount ? { 进食量: amount } : {}),
        ...(reaction ? { 宝宝反应: reaction } : {}),
        是否新食材: '否',
        ...(note ? { 备注: note } : {}),
      });
      setFoods([]); setAmount(null); setReaction(null); setNote('');
      onSuccess('辅食记录成功 🥣');
    } catch (e) {
      onSuccess('提交失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card emoji="🥣" title="辅食" accent="#FFF3E0">
      <SectionLabel>吃了什么？（可多选）</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {FOOD_TAGS.map(tag => (
          <TagButton key={tag} label={tag} selected={foods.includes(tag)} onToggle={() => toggleFood(tag)} />
        ))}
      </div>

      <SectionLabel>进食量</SectionLabel>
      <OptionRow
        options={['少量', '半碗', '大部分', '全吃完']}
        selected={amount} onSelect={setAmount}
      />

      <SectionLabel>宝宝反应</SectionLabel>
      <OptionRow
        options={['一般', '喜欢 😊', '很喜欢 😍']}
        selected={reaction} onSelect={setReaction}
        colorMap={{ '喜欢 😊': '#52BE80', '很喜欢 😍': '#1E8449' }}
      />

      <NoteInput value={note} onChange={setNote} placeholder="备注（选填，如新食材反应）" />
      <SubmitBtn onSubmit={handleSubmit} loading={loading} />
    </Card>
  );
}
