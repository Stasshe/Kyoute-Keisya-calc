'use client';

import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

import { Faculty, SUBJECTS, University, Weights } from '@/data/universities';

import GButton from './GButton';

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

  // 学部のアコーディオンはデフォルトで閉じる
  const [expandedFacs, setExpandedFacs] = useState<Set<string>>(new Set());

  function toggleFac(id: string) {
    setExpandedFacs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

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
    setExpandedFacs(prev => new Set([...prev, id]));
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
    // expand the newly targeted faculty so the user sees the new department
    setExpandedFacs(prev => new Set([...Array.from(prev), facId]));
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
    const v = value;
    const n = parseFloat(v);
    setUniv(u => ({
      ...u,
      faculties: u.faculties.map(f =>
        f.id === facId
          ? {
              ...f,
              departments: f.departments.map(d =>
                d.id === deptId
                  ? {
                      ...d,
                      weights: {
                        ...d.weights,
                        [key]: v === '' ? null : Number.isFinite(n) ? n : null,
                      },
                    }
                  : d
              ),
            }
          : f
      ),
    }));
  }

  return (
    <div className="bg-white rounded-lg border shadow-lg">
      {/* ヘッダー */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <h2 className="text-lg font-bold">大学編集</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* 大学名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">大学名</label>
          <input
            value={univ.name}
            onChange={e => updateUnivName(e.target.value)}
            className="w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="大学名を入力"
          />
        </div>

        {/* 学部リスト */}
        <div className="space-y-3">
          {univ.faculties.map(f => {
            const isExpanded = expandedFacs.has(f.id);

            return (
              <div key={f.id} className="border rounded-lg overflow-hidden bg-gray-50">
                {/* 学部ヘッダー */}
                <div
                  onClick={() => toggleFac(f.id)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 active:bg-gray-200"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm inline-flex items-center">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                    <input
                      value={f.name}
                      onChange={e => {
                        e.stopPropagation();
                        updateFacultyName(f.id, e.target.value);
                      }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 px-2 py-1.5 text-sm border rounded bg-white"
                      placeholder="学部名"
                    />
                  </div>
                  <div className="flex gap-1 ml-2">
                    <GButton
                      onClick={e => {
                        e.stopPropagation();
                        addDepartment(f.id);
                      }}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      学科追加
                    </GButton>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteFaculty(f.id);
                      }}
                      className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* 学科リスト */}
                {isExpanded && (
                  <div className="p-3 pt-0 space-y-2">
                    {f.departments.map(d => (
                      <div key={d.id} className="bg-white border rounded-lg p-3">
                        {/* 学科名 */}
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            value={d.name}
                            onChange={e => updateDepartmentName(f.id, d.id, e.target.value)}
                            className="flex-1 px-2 py-1.5 text-sm border rounded"
                            placeholder="学科名"
                          />
                          <button
                            onClick={() => deleteDepartment(f.id, d.id)}
                            className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                          >
                            削除
                          </button>
                        </div>

                        {/* 配点 */}
                        <div className="grid grid-cols-2 gap-2">
                          {SUBJECTS.map(s => (
                            <div key={s.key} className="bg-gray-50 p-2 rounded border">
                              <label className="block text-xs text-gray-600 mb-1">{s.label}</label>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={d.weights[s.key] == null ? '' : String(d.weights[s.key])}
                                onChange={e => updateDeptWeight(f.id, d.id, s.key, e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border rounded bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={addFaculty}
          className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium border border-blue-200 hover:bg-blue-100"
        >
          <span className="inline-flex items-center gap-2 justify-center">
            <Plus className="w-4 h-4" />
            学部を追加
          </span>
        </button>
      </div>

      {/* フッター */}
      <div className="p-4 border-t bg-gray-50 flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 bg-white text-gray-700 rounded-lg font-medium border hover:bg-gray-100"
        >
          キャンセル
        </button>
        <button
          onClick={() => onSave(univ)}
          className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
        >
          保存
        </button>
      </div>
    </div>
  );
}
