'use client';

import {
  DEFAULT_UNIVERSITIES,
  Department,
  SUBJECTS,
  University,
  Weights,
} from '@/data/universities';
import { useEffect, useMemo, useState } from 'react';
import DepartmentEditor from './DepartmentEditor';
import UniversityEditor from './UniversityEditor';
import UniversityList from './UniversityList';

const LS_SCORES = 'kkc_scores_v1';
const LS_SELECTED = 'kkc_selected_univ_v1';
const LS_CUSTOM = 'kkc_custom_univs_v1';

type Univ = University;

function safeNumber(v: string) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export default function Calculator() {
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

  const [editing, setEditing] = useState<null | Univ>(null);
  const [editingDept, setEditingDept] = useState<null | {
    univId: string;
    facId: string;
    deptId: string;
    temp: Department;
  }>(null);

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
    // persist custom universities (exclude default ones by id)
    const customs = universities.filter(u => !DEFAULT_UNIVERSITIES.some(d => d.id === u.id));
    localStorage.setItem(LS_CUSTOM, JSON.stringify(customs));
  }, [universities]);

  useEffect(() => {
    // initialize selected ids from localStorage or defaults after universities load
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
      faculty?: any;
      department?: any;
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
      name: '新しい大学',
      faculties: [
        {
          id: `${id}_fac1`,
          name: '学部',
          departments: [
            {
              id: `${id}_fac1_dept1`,
              name: '学科',
              weights: SUBJECTS.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {} as Weights),
            },
          ],
        },
      ],
    };
    setUniversities(u => [...u, newU]);
    setEditing(newU);
    setSelectedUnivId(id);
    setSelectedFacultyId(`${id}_fac1`);
    setSelectedDeptId(`${id}_fac1_dept1`);
  }

  function saveUniversity(univ: Univ) {
    setUniversities(u => u.map(x => (x.id === univ.id ? univ : x)));
    setEditing(null);
  }

  function deleteUniversity(id: string) {
    setUniversities(u => u.filter(x => x.id !== id));
    if (selectedUnivId === id) {
      const first = universities.find(u => u.id !== id) || DEFAULT_UNIVERSITIES[0];
      if (first) {
        setSelectedUnivId(first.id);
        setSelectedFacultyId(first.faculties[0]?.id ?? '');
        setSelectedDeptId(first.faculties[0]?.departments[0]?.id ?? '');
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
    // adjust selection if needed
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
    // adjust selection if needed
    if (selectedDeptId === deptId) {
      const u = universities.find(x => x.id === univId) ?? universities[0];
      const fac = u?.faculties.find(f => f.id === facId) ?? u?.faculties[0];
      const newDept = fac?.departments.find(d => d.id !== deptId) ?? fac?.departments[0];
      setSelectedDeptId(newDept?.id ?? '');
    }
  }

  return (
    <div className="space-y-6">
      <UniversityList
        universities={universities}
        selectedUnivId={selectedUnivId}
        
        selectedDeptId={selectedDeptId}
        editingDept={editingDept}
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
        onEditUniversity={u => {
          setEditing(u);
        }}
        onSetEditingDept={payload => setEditingDept(payload)}
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
                    departments: f2.departments.map(d2 => (d2.id === deptId ? { ...temp } : d2)),
                  };
                }),
              };
            })
          );
          setEditingDept(null);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-card border rounded-md p-4">
            <h2 className="font-medium mb-3">点数入力</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUBJECTS.map(s => (
                <div key={s.key} className="flex flex-col">
                  <label className="text-sm">{s.label}</label>
                  <input
                    inputMode="numeric"
                    value={scores[s.key] ?? ''}
                    onChange={e => updateScore(s.key, e.target.value)}
                    placeholder="空欄は0と見なします"
                    className="mt-1 px-3 py-2 border rounded-md"
                  />
                  <span className="text-xs text-muted-foreground">満点: {s.max}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <div className="flex-1 bg-card border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">計算結果</h3>
              <div className="text-3xl font-semibold">{total}</div>
              <div className="text-sm text-muted-foreground mt-1">
                選択中: {selected?.university?.name ?? ''}
              </div>
            </div>

            <div className="w-48 bg-card border rounded-md p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium mb-2">保存</h3>
                <p className="text-xs text-muted-foreground">入力は自動保存されます。</p>
              </div>
              <div className="text-right">
                <button
                  onClick={() => {
                    setScores({});
                    localStorage.removeItem(LS_SCORES);
                  }}
                  className="mt-2 px-3 py-2 border rounded-md text-sm"
                >
                  クリア
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-card border rounded-md p-4">
            <h3 className="font-medium mb-2">編集 / 詳細</h3>
            {editingDept ? (
              <div>
                <h4 className="font-medium mb-2">学科編集</h4>
                <DepartmentEditor
                  temp={editingDept.temp}
                  onChange={(t: Department) => setEditingDept(ed => (ed ? { ...ed, temp: t } : ed))}
                  onCancel={() => setEditingDept(null)}
                  onSave={() => {
                    if (!editingDept) return;
                    setUniversities(prev =>
                      prev.map(u => {
                        if (u.id !== editingDept.univId) return u;
                        return {
                          ...u,
                          faculties: u.faculties.map(f => {
                            if (f.id !== editingDept.facId) return f;
                            return {
                              ...f,
                              departments: f.departments.map(d =>
                                d.id === editingDept.deptId ? { ...editingDept.temp } : d
                              ),
                            };
                          }),
                        };
                      })
                    );
                    setEditingDept(null);
                  }}
                />
              </div>
            ) : editing ? (
              <UniversityEditor
                initialUniversity={editing}
                onCancel={() => setEditing(null)}
                onSave={u => saveUniversity(u)}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                大学または学科を選択して編集してください。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
