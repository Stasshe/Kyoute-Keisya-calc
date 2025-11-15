'use client';

import { Department, SUBJECTS } from '@/data/universities';

type Props = {
  temp: Department;
  onChange: (d: Department) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function DepartmentEditor({ temp, onChange, onCancel, onSave }: Props) {
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
        <div className="grid grid-cols-2 gap-2">
          {SUBJECTS.map(s => (
            <div key={s.key} className="bg-gray-50 p-2 rounded border">
              <label className="block text-xs text-gray-600 mb-1">{s.label}</label>
              <input
                type="text"
                inputMode="decimal"
                className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                value={temp.weights[s.key] == null ? '' : String(temp.weights[s.key])}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '') {
                    onChange({ ...temp, weights: { ...temp.weights, [s.key]: null } });
                    return;
                  }
                  const parsed = parseFloat(v);
                  if (Number.isFinite(parsed)) {
                    onChange({ ...temp, weights: { ...temp.weights, [s.key]: parsed } });
                  } else {
                    // when input isn't a valid number, set null so user can correct
                    onChange({ ...temp, weights: { ...temp.weights, [s.key]: null } });
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
