"use client";

import { SUBJECTS, Weights } from '@/data/universities';
import { useState } from 'react';

type Props = {
  initialName: string;
  initialWeights: Weights;
  onSave: (name: string, weights: Weights) => void;
  onCancel: () => void;
};

export default function UniversityEditor({ initialName, initialWeights, onSave, onCancel }: Props) {
  const [name, setName] = useState(initialName);
  const [weights, setWeights] = useState<Weights>({ ...initialWeights });

  function updateWeight(key: string, value: string) {
    const n = parseFloat(value);
    setWeights((s) => ({ ...s, [key]: Number.isFinite(n) ? n : 0 }));
  }

  return (
    <div className="p-4 bg-card border rounded-md shadow-sm">
      <div className="mb-3">
        <label className="text-sm font-medium">大学名</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SUBJECTS.map((s) => (
          <div key={s.key}>
            <label className="text-xs text-muted-foreground">{s.label}（配点）</label>
            <input
              value={String(weights[s.key] ?? 0)}
              onChange={(e) => updateWeight(s.key, e.target.value)}
              className="mt-1 w-full px-2 py-1 border rounded-md text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 border rounded-md text-sm">
          キャンセル
        </button>
        <button
          onClick={() => onSave(name || '無題', weights)}
          className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          保存
        </button>
      </div>
    </div>
  );
}
