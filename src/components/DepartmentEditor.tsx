'use client';

import { Department, SUBJECTS } from '@/data/universities';
import React from 'react';

type Props = {
  temp: Department;
  onChange: (d: Department) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function DepartmentEditor({ temp, onChange, onCancel, onSave }: Props) {
  return (
    <div className="mt-2 p-3 bg-card border rounded">
      <div className="mb-2">
        <label className="text-xs">学科名</label>
        <input
          value={temp.name}
          onChange={e => onChange({ ...temp, name: e.target.value })}
          className="mt-1 w-full px-2 py-1 border rounded"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SUBJECTS.map(s => (
          <div key={s.key}>
            <label className="text-xs">{s.label}</label>
            <input
              className="mt-1 w-full px-2 py-1 border rounded"
              value={String(temp.weights[s.key] ?? 0)}
              onChange={e => {
                const nv = Number.isFinite(parseFloat(e.target.value))
                  ? parseFloat(e.target.value)
                  : 0;
                onChange({ ...temp, weights: { ...temp.weights, [s.key]: nv } });
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1 border rounded text-sm">
          キャンセル
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
        >
          保存
        </button>
      </div>
    </div>
  );
}
