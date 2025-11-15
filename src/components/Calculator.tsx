"use client";

import { DEFAULT_UNIVERSITIES, SUBJECTS, Weights } from '@/data/universities';
import { useEffect, useMemo, useState } from 'react';
import UniversityEditor from './UniversityEditor';

const LS_SCORES = 'kkc_scores_v1';
const LS_SELECTED = 'kkc_selected_univ_v1';
const LS_CUSTOM = 'kkc_custom_univs_v1';

type Univ = { id: string; name: string; weights: Weights };

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

  const [selectedId, setSelectedId] = useState<string>(() => {
    try {
      return localStorage.getItem(LS_SELECTED) || DEFAULT_UNIVERSITIES[0].id;
    } catch {
      return DEFAULT_UNIVERSITIES[0].id;
    }
  });

  const [editing, setEditing] = useState<null | Univ>(null);

  useEffect(() => {
    localStorage.setItem(LS_SCORES, JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem(LS_SELECTED, selectedId);
  }, [selectedId]);

  useEffect(() => {
    // persist custom universities (exclude default ones by id)
    const customs = universities.filter((u) => !DEFAULT_UNIVERSITIES.some((d) => d.id === u.id));
    localStorage.setItem(LS_CUSTOM, JSON.stringify(customs));
  }, [universities]);

  const selected = universities.find((u) => u.id === selectedId) ?? universities[0];

  const total = useMemo(() => {
    if (!selected) return 0;
    let sum = 0;
    for (const s of SUBJECTS) {
      const val = Number(scores[s.key] ?? 0) || 0;
      const w = Number(selected.weights[s.key] ?? 0) || 0;
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
      weights: SUBJECTS.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {} as Weights),
    };
    setUniversities((u) => [ ...u, newU ]);
    setEditing(newU);
    setSelectedId(id);
  }

  function saveUniversity(id: string, name: string, weights: Weights) {
    setUniversities((u) => u.map((x) => (x.id === id ? { id, name, weights } : x)));
    setEditing(null);
  }

  function deleteUniversity(id: string) {
    setUniversities((u) => u.filter((x) => x.id !== id));
    if (selectedId === id) setSelectedId(DEFAULT_UNIVERSITIES[0].id);
  }

  return (
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
            <div className="text-sm text-muted-foreground mt-1">選択中: {selected?.name}</div>
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

      <aside>
        <div className="bg-card border rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">大学・配点設定</h3>
            <button onClick={addUniversity} className="text-sm px-2 py-1 border rounded-md">追加</button>
          </div>

          <div className="space-y-2">
            {universities.map((u) => (
              <div key={u.id} className={`flex items-center justify-between p-2 rounded ${u.id === selectedId ? 'bg-primary/5' : ''}`}>
                <div>
                  <label className="inline-flex items-center">
                    <input type="radio" name="univ" checked={u.id === selectedId} onChange={() => setSelectedId(u.id)} className="mr-2" />
                    <span className="font-medium">{u.name}</span>
                  </label>
                  <div className="text-xs text-muted-foreground">合計傾斜: {Math.round(Object.values(u.weights).reduce((a,b)=>a+(Number(b)||0),0)*100)/100}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setEditing(u)} className="px-2 py-1 border rounded text-sm">編集</button>
                  {!DEFAULT_UNIVERSITIES.some(d=>d.id===u.id) && (
                    <button onClick={() => deleteUniversity(u.id)} className="px-2 py-1 border rounded text-sm text-destructive">削除</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editing && (
            <div className="mt-3">
              <UniversityEditor
                initialName={editing.name}
                initialWeights={editing.weights}
                onCancel={() => setEditing(null)}
                onSave={(name, weights) => saveUniversity(editing.id, name, weights)}
              />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
