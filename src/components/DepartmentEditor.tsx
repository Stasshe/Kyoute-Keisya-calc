'use client';

import { Department, SUBJECTS } from '@/data/universities';
import { useEffect, useState } from 'react';

type Props = {
  temp: Department;
  onChange: (d: Department) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function DepartmentEditor({ temp, onChange, onCancel, onSave }: Props) {
  const [strWeights, setStrWeights] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    SUBJECTS.forEach(s => {
      const v = (temp.weights as Record<string, any>)[s.key];
      out[s.key] = v == null ? '' : String(v);
    });
    return out;
  });

  useEffect(() => {
    const out: Record<string, string> = {};
    SUBJECTS.forEach(s => {
      const v = (temp.weights as Record<string, any>)[s.key];
      out[s.key] = v == null ? '' : String(v);
    });
    setStrWeights(out);
  }, [temp]);

  return (
    <div className="p-3 bg-white border-2 border-blue-500 rounded-lg shadow-lg">
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">学科名</label>
        <input
          value={temp.name}
          onChange={e => onChange({ ...temp, name: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="学科名を入力"
        />
      </div>

      <div className="mb-3">
        <div className="text-xs font-medium text-gray-700 mb-2">配点設定</div>
        <div className="text-xs text-gray-500 mb-2">
          大学が公表している、共通テスト傾斜配点後の満点の値を入力してください。2科目目の教科（②）や情報を考慮に入れない場合は0点、または空欄にしてください。
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SUBJECTS.map(s => (
            <div key={s.key} className="bg-gray-50 p-2 rounded border">
              <label className="block text-xs text-gray-600 mb-1">{s.label}</label>
              <input
                type="text"
                inputMode="decimal"
                className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                value={strWeights[s.key] ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  setStrWeights(prev => ({ ...prev, [s.key]: v }));

                  if (v === '') {
                    onChange({ ...temp, weights: { ...temp.weights, [s.key]: null } });
                    return;
                  }

                  const parsed = parseFloat(v);
                  // Only commit numeric value when parseFloat yields a finite number.
                  // This preserves intermediate inputs such as '.' or '1.' in the UI.
                  if (Number.isFinite(parsed)) {
                    onChange({ ...temp, weights: { ...temp.weights, [s.key]: parsed } });
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200"
        >
          キャンセル
        </button>
        <button
          onClick={onSave}
          className="flex-1 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600"
        >
          保存
        </button>
      </div>
    </div>
  );
}
