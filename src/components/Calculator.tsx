"use client";

import { DEFAULT_UNIVERSITIES, SUBJECTS, Weights, University, Department } from '@/data/universities';
import { useEffect, useMemo, useState } from 'react';
import UniversityEditor from './UniversityEditor';

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
  const [editingDept, setEditingDept] = useState<null | { univId: string; facId: string; deptId: string; temp: Department }>(null);

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
    const customs = universities.filter((u) => !DEFAULT_UNIVERSITIES.some((d) => d.id === u.id));
    localStorage.setItem(LS_CUSTOM, JSON.stringify(customs));
  }, [universities]);

  useEffect(() => {
    // initialize selected ids from localStorage or defaults after universities load
    const su = localStorage.getItem(`${LS_SELECTED}_univ`);
    const sf = localStorage.getItem(`${LS_SELECTED}_fac`);
    const sd = localStorage.getItem(`${LS_SELECTED}_dept`);

    const firstUniv = universities[0];
    if (su && universities.some(u=>u.id===su)) {
      setSelectedUnivId(su);
      const un = universities.find(u=>u.id===su)!;
      const firstFac = un.faculties[0];
      setSelectedFacultyId(sf && firstFac && firstFac.departments.some(d=>d.id===sd) ? sf : firstFac?.id ?? '');
      const fac = un.faculties.find(f=>f.id=== (sf || firstFac?.id));
      setSelectedDeptId(sd && fac && fac.departments.some(d=>d.id===sd) ? sd : fac?.departments[0]?.id ?? '');
    } else if (firstUniv) {
      setSelectedUnivId(firstUniv.id);
      const f = firstUniv.faculties[0];
      setSelectedFacultyId(f?.id ?? '');
      setSelectedDeptId(f?.departments[0]?.id ?? '');
    }
  }, [universities]);

  const selected = useMemo(()=>{
    const u = universities.find((u) => u.id === selectedUnivId) ?? universities[0];
    const fac = u?.faculties.find(f=>f.id===selectedFacultyId) ?? u?.faculties[0];
    const dept = fac?.departments.find(d=>d.id===selectedDeptId) ?? fac?.departments[0];
    return { university: u, faculty: fac, department: dept } as { university?: Univ; faculty?: any; department?: any };
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
    setScores((s) => ({ ...s, [key]: safeNumber(value) }));
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
            { id: `${id}_fac1_dept1`, name: '学科', weights: SUBJECTS.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {} as Weights) },
          ],
        },
      ],
    };
    setUniversities((u) => [ ...u, newU ]);
    setEditing(newU);
    setSelectedUnivId(id);
    setSelectedFacultyId(`${id}_fac1`);
    setSelectedDeptId(`${id}_fac1_dept1`);
  }

  function saveUniversity(univ: Univ) {
    setUniversities((u) => u.map((x) => (x.id === univ.id ? univ : x)));
    setEditing(null);
  }

  function deleteUniversity(id: string) {
    setUniversities((u) => u.filter((x) => x.id !== id));
    if (selectedUnivId === id) {
      const first = universities.find(u=>u.id!==id) || DEFAULT_UNIVERSITIES[0];
      if (first) {
        setSelectedUnivId(first.id);
        setSelectedFacultyId(first.faculties[0]?.id ?? '');
        setSelectedDeptId(first.faculties[0]?.departments[0]?.id ?? '');
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Universities list - moved to top, vertical */}
      <div className="bg-card border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">大学リスト（上から順に選択）</h3>
          <div className="flex gap-2">
            <button onClick={addUniversity} className="text-sm px-2 py-1 border rounded-md">大学追加</button>
          </div>
        </div>

        <div className="space-y-3">
          {universities.map((u) => (
            <div key={u.id} className="border rounded p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUnivId(u.id);
                        const f = u.faculties[0];
                        setSelectedFacultyId(f?.id ?? '');
                        setSelectedDeptId(f?.departments[0]?.id ?? '');
                      }}
                      className="px-2 py-1 border rounded text-sm"
                    >選択</button>
                    <span className="font-medium">{u.name}</span>
                    {!DEFAULT_UNIVERSITIES.some(d=>d.id===u.id) && (
                      <button onClick={() => deleteUniversity(u.id)} className="px-2 py-1 border rounded text-sm text-destructive">削除</button>
                    )}
                  </div>

                  <div className="mt-2 space-y-2">
                    {u.faculties.map(f=> (
                      <div key={f.id} className="pl-4">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm">{f.name}</strong>
                          <button onClick={()=> { setSelectedUnivId(u.id); setSelectedFacultyId(f.id); const d = f.departments[0]; setSelectedDeptId(d?.id ?? ''); }} className="px-2 py-0.5 text-xs border rounded">学部選択</button>
                          <button onClick={()=> { /* add department to this faculty */ const id = `dept_${Date.now()}`; setUniversities(prev=> prev.map(x=> x.id===u.id ? { ...x, faculties: x.faculties.map(ff=> ff.id===f.id ? { ...ff, departments: [...ff.departments, { id, name: '新しい学科', weights: SUBJECTS.reduce((acc,s)=>({ ...acc, [s.key]: 0 }), {} as Weights) }] } : ff) } : x)); }} className="px-2 py-0.5 text-xs border rounded">学科追加</button>
                        </div>

                        <div className="mt-1 grid grid-cols-2 gap-2">
                          {f.departments.map(d=> (
                            <div key={d.id} className="flex items-center justify-between gap-2 bg-white p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <input type="radio" name="dept" checked={selectedDeptId===d.id && selectedUnivId===u.id} onChange={()=> { setSelectedUnivId(u.id); setSelectedFacultyId(f.id); setSelectedDeptId(d.id); }} />
                                <span className="text-sm">{d.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={()=> setEditingDept({ univId: u.id, facId: f.id, deptId: d.id, temp: { ...d } })} className="px-2 py-0.5 text-xs border rounded">編集</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-card border rounded-md p-4">
            <h2 className="font-medium mb-3">点数入力</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUBJECTS.map((s) => (
                <div key={s.key} className="flex flex-col">
                  <label className="text-sm">{s.label}</label>
                  <input
                    inputMode="numeric"
                    value={scores[s.key] ?? ''}
                    onChange={(e) => updateScore(s.key, e.target.value)}
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
              <div className="text-sm text-muted-foreground mt-1">選択中: {selected?.university?.name ?? ''}</div>
            </div>

            <div className="w-48 bg-card border rounded-md p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium mb-2">保存</h3>
                <p className="text-xs text-muted-foreground">入力は自動保存されます。</p>
              </div>
              <div className="text-right">
                <button
                  onClick={() => { setScores({}); localStorage.removeItem(LS_SCORES); }}
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
                <div className="mb-2">
                  <label className="text-sm">学科名</label>
                  <input className="mt-1 w-full px-2 py-1 border rounded" value={editingDept.temp.name} onChange={(e)=> setEditingDept(ed=> ed ? ({ ...ed, temp: { ...ed.temp, name: e.target.value } }) : ed)} />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-auto">
                  {SUBJECTS.map(s=> (
                    <div key={s.key}>
                      <label className="text-xs">{s.label}</label>
                      <input className="mt-1 w-full px-2 py-1 border rounded" value={String(editingDept.temp.weights[s.key] ?? 0)} onChange={(e)=> setEditingDept(ed=> ed ? ({ ...ed, temp: { ...ed.temp, weights: { ...ed.temp.weights, [s.key]: Number.isFinite(parseFloat(e.target.value)) ? parseFloat(e.target.value) : 0 } } }) : ed)} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2 justify-end">
                  <button onClick={()=> setEditingDept(null)} className="px-3 py-2 border rounded">キャンセル</button>
                  <button onClick={()=> {
                    if (!editingDept) return;
                    setUniversities(prev=> prev.map(u=> {
                      if (u.id !== editingDept.univId) return u;
                      return { ...u, faculties: u.faculties.map(f=> {
                        if (f.id !== editingDept.facId) return f;
                        return { ...f, departments: f.departments.map(d=> d.id === editingDept.deptId ? { ...editingDept.temp } : d) };
                      }) };
                    }));
                    setEditingDept(null);
                  }} className="px-3 py-2 bg-primary text-primary-foreground rounded">保存</button>
                </div>
              </div>
            ) : editing ? (
              <UniversityEditor initialUniversity={editing} onCancel={() => setEditing(null)} onSave={(u) => saveUniversity(u)} />
            ) : (
              <div className="text-sm text-muted-foreground">大学または学科を選択して編集してください。</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
