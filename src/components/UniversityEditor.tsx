'use client';

import { Faculty, SUBJECTS, University, Weights } from '@/data/universities';
import { useState } from 'react';

type Props = {
  initialUniversity: University;
  onSave: (univ: University) => void;
  onCancel: () => void;
};

export default function UniversityEditor({ initialUniversity, onSave, onCancel }: Props) {
  const [univ, setUniv] = useState<University>({
    ...initialUniversity,
    faculties: initialUniversity.faculties.map(f => ({
      ...f,
      departments: f.departments.map(d => ({ ...d })),
    })),
  });

  function updateUnivName(name: string) {
    setUniv(u => ({ ...u, name }));
  }

  function updateFacultyName(facId: string, name: string) {
    setUniv(u => ({
      ...u,
      faculties: u.faculties.map(f => (f.id === facId ? { ...f, name } : f)),
    }));
  }

  function addFaculty() {
    const id = `fac_${Date.now()}`;
    const newF: Faculty = {
      id,
      name: '新しい学部',
      departments: [
        {
          id: `${id}_d1`,
          name: '新しい学科',
          weights: SUBJECTS.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {} as Weights),
        },
      ],
    };
    setUniv(u => ({ ...u, faculties: [...u.faculties, newF] }));
  }

  function deleteFaculty(facId: string) {
    if (!confirm('この学部を削除しますか？学科も全て削除されます。')) return;
    setUniv(u => ({ ...u, faculties: u.faculties.filter(f => f.id !== facId) }));
  }

  function addDepartment(facId: string) {
    const id = `dept_${Date.now()}`;
    setUniv(u => ({
      ...u,
      faculties: u.faculties.map(f =>
        f.id === facId
          ? {
              ...f,
              departments: [
                ...f.departments,
                {
                  id,
                  name: '新しい学科',
                  weights: SUBJECTS.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {} as Weights),
                },
              ],
            }
          : f
      ),
    }));
  }

  function deleteDepartment(facId: string, deptId: string) {
    if (!confirm('この学科を削除しますか？')) return;
    setUniv(u => ({
      ...u,
      faculties: u.faculties.map(f =>
        f.id === facId ? { ...f, departments: f.departments.filter(d => d.id !== deptId) } : f
      ),
    }));
  }

  function updateDepartmentName(facId: string, deptId: string, name: string) {
    setUniv(u => ({
      ...u,
      faculties: u.faculties.map(f =>
        f.id === facId
          ? { ...f, departments: f.departments.map(d => (d.id === deptId ? { ...d, name } : d)) }
          : f
      ),
    }));
  }

  function updateDeptWeight(facId: string, deptId: string, key: string, value: string) {
    const n = parseFloat(value);
    setUniv(u => ({
      ...u,
      faculties: u.faculties.map(f =>
        f.id === facId
          ? {
              ...f,
              departments: f.departments.map(d =>
                d.id === deptId
                  ? { ...d, weights: { ...d.weights, [key]: Number.isFinite(n) ? n : 0 } }
                  : d
              ),
            }
          : f
      ),
    }));
  }

  return (
    <div className="p-4 bg-card border rounded-md shadow-sm">
      <div className="mb-3">
        <label className="text-sm font-medium">大学名</label>
        <input
          value={univ.name}
          onChange={e => updateUnivName(e.target.value)}
          className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-sm"
        />
      </div>

      <div className="space-y-4">
        {univ.faculties.map(f => (
          <div key={f.id} className="p-2 border rounded">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={f.name}
                onChange={e => updateFacultyName(f.id, e.target.value)}
                className="flex-1 px-2 py-1 border rounded"
              />
              <button
                onClick={() => addDepartment(f.id)}
                className="px-2 py-1 border rounded text-sm"
              >
                学科追加
              </button>
              <button
                onClick={() => deleteFaculty(f.id)}
                className="px-2 py-1 border rounded text-sm text-destructive"
              >
                学部削除
              </button>
            </div>

            <div className="space-y-2">
              {f.departments.map(d => (
                <div key={d.id} className="p-2 bg-white border rounded">
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      value={d.name}
                      onChange={e => updateDepartmentName(f.id, d.id, e.target.value)}
                      className="flex-1 px-2 py-1 border rounded"
                    />
                    <button
                      onClick={() => deleteDepartment(f.id, d.id)}
                      className="px-2 py-1 border rounded text-sm text-destructive"
                    >
                      学科削除
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {SUBJECTS.map(s => (
                      <div key={s.key}>
                        <label className="text-xs text-muted-foreground">{s.label}</label>
                        <input
                          value={String(d.weights[s.key] ?? 0)}
                          onChange={e => updateDeptWeight(f.id, d.id, s.key, e.target.value)}
                          className="mt-1 w-full px-2 py-1 border rounded-md text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 border rounded-md text-sm">
          キャンセル
        </button>
        <button
          onClick={() => onSave(univ)}
          className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          保存
        </button>
        <button onClick={addFaculty} className="px-3 py-2 border rounded-md text-sm">
          学部追加
        </button>
      </div>
    </div>
  );
}
