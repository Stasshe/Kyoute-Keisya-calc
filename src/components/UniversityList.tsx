'use client';

import React from 'react';
import { University, Department } from '@/data/universities';
import DepartmentEditor from './DepartmentEditor';

type Props = {
  universities: University[];
  selectedUnivId: string;
  selectedDeptId: string;
  editingDept: null | { univId: string; facId: string; deptId: string; temp: Department };
  onAddUniversity: () => void;
  onSelectUniversity: (univId: string) => void;
  onSelectFaculty: (univId: string, facId: string) => void;
  onSelectDept: (univId: string, facId: string, deptId: string) => void;
  onEditUniversity: (u: University) => void;
  onSetEditingDept: (
    payload: null | { univId: string; facId: string; deptId: string; temp: Department }
  ) => void;
  addDepartment: (univId: string, facId: string) => void;
  deleteUniversity: (id: string) => void;
  deleteFaculty: (univId: string, facId: string) => void;
  deleteDepartment: (univId: string, facId: string, deptId: string) => void;
  saveDept: (payload: { univId: string; facId: string; deptId: string; temp: Department }) => void;
};

export default function UniversityList({
  universities,
  selectedUnivId,
  selectedDeptId,
  editingDept,
  onAddUniversity,
  onSelectUniversity,
  onSelectFaculty,
  onSelectDept,
  onEditUniversity,
  onSetEditingDept,
  addDepartment,
  deleteUniversity,
  deleteFaculty,
  deleteDepartment,
  saveDept,
}: Props) {
  return (
    <div className="bg-card border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">大学リスト（上から順に選択）</h3>
        <div className="flex gap-2">
          <button onClick={onAddUniversity} className="text-sm px-2 py-1 border rounded-md">
            大学追加
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {universities.map(u => (
          <div key={u.id} className="border rounded p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectUniversity(u.id)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    選択
                  </button>
                  <span className="font-medium">{u.name}</span>
                  {/* delete is handled outside for defaults; caller should pass correct delete handler */}
                </div>

                <div className="mt-2 space-y-2">
                  {u.faculties.map(f => (
                    <div key={f.id} className="pl-4">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm">{f.name}</strong>
                        <button
                          onClick={() => onSelectFaculty(u.id, f.id)}
                          className="px-2 py-0.5 text-xs border rounded"
                        >
                          学部選択
                        </button>
                        <button
                          onClick={() => addDepartment(u.id, f.id)}
                          className="px-2 py-0.5 text-xs border rounded"
                        >
                          学科追加
                        </button>
                        <button
                          onClick={() => deleteFaculty(u.id, f.id)}
                          className="px-2 py-0.5 text-xs border rounded text-destructive"
                        >
                          学部削除
                        </button>
                      </div>

                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {f.departments.map(d => (
                          <div key={d.id} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 bg-white p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`dept_${u.id}`}
                                  checked={selectedDeptId === d.id && selectedUnivId === u.id}
                                  onChange={() => onSelectDept(u.id, f.id, d.id)}
                                />
                                <span className="text-sm">{d.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    onSetEditingDept({
                                      univId: u.id,
                                      facId: f.id,
                                      deptId: d.id,
                                      temp: { ...d },
                                    })
                                  }
                                  className="px-2 py-0.5 text-xs border rounded"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => deleteDepartment(u.id, f.id, d.id)}
                                  className="px-2 py-0.5 text-xs border rounded text-destructive"
                                >
                                  学科削除
                                </button>
                              </div>
                            </div>

                            {/* Inline editor under the department when editing */}
                            {editingDept &&
                              editingDept.univId === u.id &&
                              editingDept.facId === f.id &&
                              editingDept.deptId === d.id && (
                                <DepartmentEditor
                                  temp={editingDept.temp}
                                  onChange={(t: Department) => onSetEditingDept({ ...editingDept, temp: t })}
                                  onCancel={() => onSetEditingDept(null)}
                                  onSave={() => saveDept(editingDept)}
                                />
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-col gap-2">
                  {!['default', 'osaka'].includes(u.id) && (
                    <button
                      onClick={() => deleteUniversity(u.id)}
                      className="px-2 py-1 border rounded text-sm text-destructive"
                    >
                      削除
                    </button>
                  )}

                  <button
                    onClick={() => onEditUniversity(u)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    編集
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
