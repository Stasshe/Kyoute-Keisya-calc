'use client';

import { Award, FileText, GraduationCap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_UNIVERSITIES,
  Department,
  Faculty,
  SUBJECTS,
  University,
  Weights,
} from '@/data/universities';

import ScoresTab from './Tab/ScoresTab';
import UniversityTab from './Tab/UniversityTab';
import ResultsTab from './Tab/resultTab';

const LS_SCORES = 'kkc_scores_v1';
const LS_SELECTED = 'kkc_selected_univ_v1';
const LS_CUSTOM = 'kkc_custom_univs_v1';

type Univ = University;

function safeNumber(v: string) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export default function Calculator() {
  const [activeTab, setActiveTab] = useState<'input' | 'list' | 'result'>('input');
  const [scores, setScores] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(LS_SCORES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [universities, setUniversities] = useState<Univ[]>(() => {
    try {
      const raw = localStorage.getItem(LS_CUSTOM);
      const customs = raw ? JSON.parse(raw) : [];
      return [...DEFAULT_UNIVERSITIES, ...customs];
    } catch {
      return [...DEFAULT_UNIVERSITIES];
    }
  });

  const [selectedUnivId, setSelectedUnivId] = useState<string>('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [editingDept, setEditingDept] = useState<null | {
    univId: string;
    facId: string;
    deptId: string;
    temp: Department;
  }>(null);
  const [editingUniversity, setEditingUniversity] = useState<null | University>(null);

  useEffect(() => {
    localStorage.setItem(LS_SCORES, JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem(`${LS_SELECTED}_univ`, selectedUnivId);
  }, [selectedUnivId]);

  useEffect(() => {
    localStorage.setItem(`${LS_SELECTED}_fac`, selectedFacultyId);
  }, [selectedFacultyId]);

  useEffect(() => {
    localStorage.setItem(`${LS_SELECTED}_dept`, selectedDeptId);
  }, [selectedDeptId]);

  useEffect(() => {
    const customs = universities.filter(u => !DEFAULT_UNIVERSITIES.some(d => d.id === u.id));
    localStorage.setItem(LS_CUSTOM, JSON.stringify(customs));
  }, [universities]);

  useEffect(() => {
    const su = localStorage.getItem(`${LS_SELECTED}_univ`);
    const sf = localStorage.getItem(`${LS_SELECTED}_fac`);
    const sd = localStorage.getItem(`${LS_SELECTED}_dept`);

    const firstUniv = universities[0];
    if (su && universities.some(u => u.id === su)) {
      setSelectedUnivId(su);
      const un = universities.find(u => u.id === su)!;
      const firstFac = un.faculties[0];
      setSelectedFacultyId(
        sf && firstFac && firstFac.departments.some(d => d.id === sd) ? sf : (firstFac?.id ?? '')
      );
      const fac = un.faculties.find(f => f.id === (sf || firstFac?.id));
      setSelectedDeptId(
        sd && fac && fac.departments.some(d => d.id === sd) ? sd : (fac?.departments[0]?.id ?? '')
      );
    } else if (firstUniv) {
      setSelectedUnivId(firstUniv.id);
      const f = firstUniv.faculties[0];
      setSelectedFacultyId(f?.id ?? '');
      setSelectedDeptId(f?.departments[0]?.id ?? '');
    }
  }, [universities]);

  const selected = useMemo(() => {
    const u = universities.find(u => u.id === selectedUnivId) ?? universities[0];
    const fac = u?.faculties.find(f => f.id === selectedFacultyId) ?? u?.faculties[0];
    const dept = fac?.departments.find(d => d.id === selectedDeptId) ?? fac?.departments[0];
    return { university: u, faculty: fac, department: dept } as {
      university?: Univ;
      faculty?: Faculty;
      department?: Department;
    };
  }, [universities, selectedUnivId, selectedFacultyId, selectedDeptId]);

  const total = useMemo(() => {
    const dept = selected?.department;
    if (!dept) return 0;
    let sum = 0;
    for (const s of SUBJECTS) {
      const val = Number(scores[s.key] ?? 0) || 0;
      const w = Number(dept.weights[s.key] ?? 0) || 0;
      sum += (val / s.max) * w;
    }
    return Math.round(sum * 100) / 100;
  }, [scores, selected]);

  function updateScore(key: string, value: string) {
    setScores(s => ({ ...s, [key]: safeNumber(value) }));
  }

  function addUniversity() {
    const id = `custom_${Date.now()}`;
    const newU: Univ = {
      id,
      name: '大阪大学',
      faculties: [
        {
          id: `${id}_fac1`,
          name: '工学部',
          departments: [
            {
              id: `${id}_fac1_dept1`,
              name: '地球総合学科',
              weights: SUBJECTS.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {} as Weights),
            },
          ],
        },
      ],
    };
    setUniversities(u => [...u, newU]);
    setSelectedUnivId(id);
    setSelectedFacultyId(`${id}_fac1`);
    setSelectedDeptId(`${id}_fac1_dept1`);
  }

  function deleteUniversity(id: string) {
    setUniversities(u => u.filter(x => x.id !== id));
    if (selectedUnivId === id) {
      const first = universities.find(u => u.id !== id);
      if (first) {
        setSelectedUnivId(first.id);
        setSelectedFacultyId(first.faculties[0]?.id ?? '');
        setSelectedDeptId(first.faculties[0]?.departments[0]?.id ?? '');
      } else {
        setSelectedUnivId('');
        setSelectedFacultyId('');
        setSelectedDeptId('');
      }
    }
  }

  function deleteFaculty(univId: string, facId: string) {
    if (!confirm('この学部を削除しますか？ 学科も全て削除されます。')) return;
    setUniversities(prev =>
      prev.map(u => {
        if (u.id !== univId) return u;
        return { ...u, faculties: u.faculties.filter(f => f.id !== facId) };
      })
    );
    if (selectedFacultyId === facId) {
      const u = universities.find(x => x.id === univId) ?? universities[0];
      const newFac = u?.faculties.find(f => f.id !== facId) ?? u?.faculties[0];
      setSelectedFacultyId(newFac?.id ?? '');
      setSelectedDeptId(newFac?.departments[0]?.id ?? '');
    }
  }

  function deleteDepartment(univId: string, facId: string, deptId: string) {
    if (!confirm('この学科を削除しますか？')) return;
    setUniversities(prev =>
      prev.map(u => {
        if (u.id !== univId) return u;
        return {
          ...u,
          faculties: u.faculties.map(f =>
            f.id === facId ? { ...f, departments: f.departments.filter(d => d.id !== deptId) } : f
          ),
        };
      })
    );
    if (selectedDeptId === deptId) {
      const u = universities.find(x => x.id === univId) ?? universities[0];
      const fac = u?.faculties.find(f => f.id === facId) ?? u?.faculties[0];
      const newDept = fac?.departments.find(d => d.id !== deptId) ?? fac?.departments[0];
      setSelectedDeptId(newDept?.id ?? '');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー - 固定表示 */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-gray-900">共通テスト換算計算機</h1>
            <button
              onClick={() => {
                if (confirm('全ての入力データをクリアしますか？')) {
                  setScores({});
                  localStorage.removeItem(LS_SCORES);
                }
              }}
              className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100"
            >
              リセット
            </button>
          </div>

          {/* 計算結果表示 */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs opacity-90 mb-0.5">換算後得点</div>
                <div className="text-3xl font-bold">{total}</div>
              </div>
              <div className="text-right text-xs opacity-90 max-w-[60%]">
                <div className="truncate">{selected?.university?.name}</div>
                <div className="truncate">{selected?.faculty?.name}</div>
                <div className="truncate font-medium">{selected?.department?.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'input'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <FileText className="w-4 h-4" />
              点数入力
            </span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <GraduationCap className="w-4 h-4" />
              大学選択
            </span>
          </button>
          <button
            onClick={() => setActiveTab('result')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'result'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="inline-flex items-center gap-2 justify-center">
              <Award className="w-4 h-4" />
              結果
            </span>
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="pb-4">
        {activeTab === 'input' && <ScoresTab scores={scores} updateScore={updateScore} />}

        {activeTab === 'list' && (
          <div className="p-3">
            <UniversityTab
              universities={universities}
              editingUniversity={editingUniversity}
              editingDept={editingDept}
              selectedUnivId={selectedUnivId}
              selectedDeptId={selectedDeptId}
              onAddUniversity={addUniversity}
              onSelectUniversity={id => {
                setSelectedUnivId(id);
                const u = universities.find(x => x.id === id) || universities[0];
                const f = u?.faculties[0];
                setSelectedFacultyId(f?.id ?? '');
                setSelectedDeptId(f?.departments[0]?.id ?? '');
              }}
              onSelectFaculty={(univId, facId) => {
                setSelectedUnivId(univId);
                setSelectedFacultyId(facId);
                const u = universities.find(x => x.id === univId) || universities[0];
                const f = u?.faculties.find(ff => ff.id === facId) || u?.faculties[0];
                setSelectedDeptId(f?.departments[0]?.id ?? '');
              }}
              onSelectDept={(univId, facId, deptId) => {
                setSelectedUnivId(univId);
                setSelectedFacultyId(facId);
                setSelectedDeptId(deptId);
              }}
              onSetEditingDept={p => setEditingDept(p)}
              onEditUniversity={u => setEditingUniversity(u)}
              addDepartment={(univId, facId) => {
                const id = `dept_${Date.now()}`;
                setUniversities(prev =>
                  prev.map(x =>
                    x.id === univId
                      ? {
                          ...x,
                          faculties: x.faculties.map(ff =>
                            ff.id === facId
                              ? {
                                  ...ff,
                                  departments: [
                                    ...ff.departments,
                                    {
                                      id,
                                      name: '新しい学科',
                                      weights: SUBJECTS.reduce(
                                        (acc, s) => ({ ...acc, [s.key]: 0 }),
                                        {} as Weights
                                      ),
                                    },
                                  ],
                                }
                              : ff
                          ),
                        }
                      : x
                  )
                );
              }}
              deleteUniversity={id => deleteUniversity(id)}
              deleteFaculty={(univId, facId) => deleteFaculty(univId, facId)}
              deleteDepartment={(univId, facId, deptId) => deleteDepartment(univId, facId, deptId)}
              saveDept={({ univId, facId, deptId, temp }) => {
                setUniversities(prev =>
                  prev.map(u2 => {
                    if (u2.id !== univId) return u2;
                    return {
                      ...u2,
                      faculties: u2.faculties.map(f2 => {
                        if (f2.id !== facId) return f2;
                        return {
                          ...f2,
                          departments: f2.departments.map(d2 =>
                            d2.id === deptId ? { ...temp } : d2
                          ),
                        };
                      }),
                    };
                  })
                );
                setEditingDept(null);
              }}
              onSaveUniversity={u => {
                setUniversities(prev => prev.map(p => (p.id === u.id ? u : p)));
                setEditingUniversity(null);
              }}
              onCancelEditUniversity={() => setEditingUniversity(null)}
            />
          </div>
        )}

        {activeTab === 'result' && (
          <div className="p-3">
            <ResultsTab
              scores={scores}
              department={selected.department!}
              universityName={selected.university?.name ?? ''}
              facultyName={selected.faculty?.name ?? ''}
              departmentName={selected.department?.name ?? ''}
              total={total}
            />
          </div>
        )}
      </div>
    </div>
  );
}
