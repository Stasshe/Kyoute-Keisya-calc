'use client';

import { SUBJECTS } from '@/data/universities';

type Props = {
  scores: Record<string, number>;
  updateScore: (key: string, value: string) => void;
};

export default function ScoresTab({ scores, updateScore }: Props) {
  return (
    <div className="p-3 space-y-2">
      {SUBJECTS.map(s => (
        <div key={s.key} className="bg-white rounded-lg border p-2.5 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">{s.label}</label>
            <span className="text-xs text-gray-500">/ {s.max}点</span>
          </div>
          <input
            type="number"
            inputMode="numeric"
            value={scores[s.key] ?? ''}
            onChange={e => updateScore(s.key, e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2.5 text-base border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      ))}
      <div className="text-xs text-gray-500 text-center pt-2">入力は自動保存されます</div>
    </div>
  );
}
