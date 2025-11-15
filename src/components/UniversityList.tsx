'use client';

import { useState } from 'react';

import { Department, University } from '@/data/universities';

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
  onSelectDept,
  onEditUniversity,
  onSetEditingDept,
  addDepartment,
  deleteUniversity,
  deleteFaculty,
  deleteDepartment,
  saveDept,
}: Props) {
  const [expandedUnivs, setExpandedUnivs] = useState<Set<string>>(new Set([selectedUnivId]));
  const [expandedFacs, setExpandedFacs] = useState<Set<string>>(new Set());

  function toggleUniv(id: string) {
    setExpandedUnivs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

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

  return (
    <div className="space-y-2">
      <button
        onClick={onAddUniversity}
        className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        ➕ 大学を追加
      </button>

      <div className="space-y-2">
        {universities.map(u => {
          const isExpanded = expandedUnivs.has(u.id);
          const isSelected = selectedUnivId === u.id;

          return (
            <div
              key={u.id}
              className={`bg-white rounded-lg border shadow-sm overflow-hidden ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* 大学ヘッダー */}
              <div
                onClick={() => toggleUniv(u.id)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                  <span className="font-medium text-gray-900">{u.name}</span>
                  {isSelected && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      選択中
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onEditUniversity(u);
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    編集
                  </button>
                  {u.id !== 'default' && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`${u.name}を削除しますか？`)) {
                          deleteUniversity(u.id);
                        }
                      }}
                      className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>

              {/* 学部・学科リスト */}
              {isExpanded && (
                <div className="border-t bg-gray-50">
                  {u.faculties.map(f => {
                    const isFacExpanded = expandedFacs.has(f.id);

                    return (
                      <div key={f.id} className="border-b last:border-b-0">
                        {/* 学部ヘッダー */}
                        <div
                          onClick={() => toggleFac(f.id)}
                          className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-100 active:bg-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{isFacExpanded ? '▼' : '▶'}</span>
                            <span className="text-sm font-medium text-gray-800">{f.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                addDepartment(u.id, f.id);
                              }}
                              className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            >
                              学科追加
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteFaculty(u.id, f.id);
                              }}
                              className="px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                            >
                              削除
                            </button>
                          </div>
                        </div>

                        {/* 学科リスト */}
                        {isFacExpanded && (
                          <div className="px-4 pb-2 space-y-1.5">
                            {f.departments.map(d => {
                              const isDeptSelected = selectedDeptId === d.id && isSelected;
                              const isEditing =
                                editingDept?.univId === u.id &&
                                editingDept?.facId === f.id &&
                                editingDept?.deptId === d.id;

                              return (
                                <div key={d.id} className="space-y-1.5">
                                  <div
                                    onClick={() => onSelectDept(u.id, f.id, d.id)}
                                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                                      isDeptSelected
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white hover:bg-gray-100 border'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        checked={isDeptSelected}
                                        onChange={() => {}}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm font-medium">{d.name}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={e => {
                                          e.stopPropagation();
                                          onSetEditingDept({
                                            univId: u.id,
                                            facId: f.id,
                                            deptId: d.id,
                                            temp: { ...d },
                                          });
                                        }}
                                        className={`px-2 py-0.5 text-xs rounded ${
                                          isDeptSelected
                                            ? 'bg-blue-400 text-white hover:bg-blue-300'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                      >
                                        編集
                                      </button>
                                      <button
                                        onClick={e => {
                                          e.stopPropagation();
                                          deleteDepartment(u.id, f.id, d.id);
                                        }}
                                        className={`px-2 py-0.5 text-xs rounded ${
                                          isDeptSelected
                                            ? 'bg-red-400 text-white hover:bg-red-300'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                      >
                                        削除
                                      </button>
                                    </div>
                                  </div>

                                  {isEditing && (
                                    <DepartmentEditor
                                      temp={editingDept.temp}
                                      onChange={(t: Department) =>
                                        onSetEditingDept({ ...editingDept, temp: t })
                                      }
                                      onCancel={() => onSetEditingDept(null)}
                                      onSave={() => saveDept(editingDept)}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
