'use client';

import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { SUBJECTS } from '@/data/universities';
import { ScoreSet } from '@/types/scoreSet';

import ScoreSetExportImport from '../ScoreSetExportImport';

type Props = {
  scores: Record<string, string>;
  updateScore: (key: string, value: string) => void;
};

const LS_SCORE_SETS = 'kkc_score_sets_v2';
const LS_ACTIVE_SET = 'kkc_active_set_v2';

export default function ScoresTab({ scores, updateScore }: Props) {
  const [scoreSets, setScoreSets] = useState<ScoreSet[]>([]);
  const [activeSetId, setActiveSetId] = useState<string>('');
  const [editingSetId, setEditingSetId] = useState<string>('');
  const [editName, setEditName] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const savedSets = localStorage.getItem(LS_SCORE_SETS);
      const savedActiveId = localStorage.getItem(LS_ACTIVE_SET);

      if (savedSets) {
        const sets: ScoreSet[] = JSON.parse(savedSets);
        setScoreSets(sets);

        if (savedActiveId && sets.some(s => s.id === savedActiveId)) {
          setActiveSetId(savedActiveId);
          const activeSet = sets.find(s => s.id === savedActiveId);
          if (activeSet) {
            Object.keys(activeSet.scores).forEach(key => {
              updateScore(key, activeSet.scores[key]);
            });
          }
        } else if (sets.length > 0) {
          setActiveSetId(sets[0].id);
          Object.keys(sets[0].scores).forEach(key => {
            updateScore(key, sets[0].scores[key]);
          });
        }
      } else {
        const defaultSet: ScoreSet = {
          id: `set_${Date.now()}`,
          name: '模試データ 1',
          scores: {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setScoreSets([defaultSet]);
        setActiveSetId(defaultSet.id);
        localStorage.setItem(LS_SCORE_SETS, JSON.stringify([defaultSet]));
        localStorage.setItem(LS_ACTIVE_SET, defaultSet.id);
      }
    } catch (e) {
      console.error('Failed to load score sets:', e);
    }
  }, []);

  useEffect(() => {
    if (!activeSetId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setScoreSets(prevSets => {
        const updatedSets = prevSets.map(set => {
          if (set.id === activeSetId) {
            return {
              ...set,
              scores: { ...scores },
              updatedAt: Date.now(),
            };
          }
          return set;
        });
        localStorage.setItem(LS_SCORE_SETS, JSON.stringify(updatedSets));
        return updatedSets;
      });
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [scores, activeSetId]);

  const addNewSet = () => {
    const newSet: ScoreSet = {
      id: `set_${Date.now()}`,
      name: `模試データ ${scoreSets.length + 1}`,
      scores: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...scoreSets, newSet];
    setScoreSets(updated);
    setActiveSetId(newSet.id);
    localStorage.setItem(LS_SCORE_SETS, JSON.stringify(updated));
    localStorage.setItem(LS_ACTIVE_SET, newSet.id);
    SUBJECTS.forEach(s => updateScore(s.key, ''));
  };

  const switchSet = (id: string) => {
    setActiveSetId(id);
    localStorage.setItem(LS_ACTIVE_SET, id);
    const set = scoreSets.find(s => s.id === id);
    if (set) {
      SUBJECTS.forEach(s => {
        updateScore(s.key, set.scores[s.key] ?? '');
      });
    }
  };

  const deleteSet = (id: string) => {
    if (scoreSets.length === 1) {
      alert('最後のデータセットは削除できません');
      return;
    }
    if (!confirm('このデータセットを削除しますか？')) return;

    const updated = scoreSets.filter(s => s.id !== id);
    setScoreSets(updated);
    localStorage.setItem(LS_SCORE_SETS, JSON.stringify(updated));

    if (activeSetId === id) {
      const newActive = updated[0];
      setActiveSetId(newActive.id);
      localStorage.setItem(LS_ACTIVE_SET, newActive.id);
      SUBJECTS.forEach(s => {
        updateScore(s.key, newActive.scores[s.key] ?? '');
      });
    }
  };

  const startEditName = (setId: string, currentName: string) => {
    setEditingSetId(setId);
    setEditName(currentName);
  };

  const saveEditName = () => {
    if (!editName.trim()) {
      alert('名前を入力してください');
      return;
    }
    const updated = scoreSets.map(s => (s.id === editingSetId ? { ...s, name: editName.trim() } : s));
    setScoreSets(updated);
    localStorage.setItem(LS_SCORE_SETS, JSON.stringify(updated));
    setEditingSetId('');
  };

  const cancelEditName = () => {
    setEditingSetId('');
    setEditName('');
  };

  const handleImport = (importedSets: ScoreSet[]) => {
    const existingIds = new Set(scoreSets.map(s => s.id));
    const newSets = importedSets.map(s => {
      if (existingIds.has(s.id)) {
        return { ...s, id: `set_${Date.now()}_${Math.floor(Math.random() * 1000000)}` };
      }
      return s;
    });
    const updated = [...scoreSets, ...newSets];
    setScoreSets(updated);
    localStorage.setItem(LS_SCORE_SETS, JSON.stringify(updated));
  };

  const activeSet = scoreSets.find(s => s.id === activeSetId);

  return (
    <div className="p-3 space-y-3">
      <ScoreSetExportImport scoreSets={scoreSets} onImport={handleImport} />

      <div className="bg-white rounded-lg border shadow-sm p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">保存データ一覧</h3>
          <button
            onClick={addNewSet}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            新規作成
          </button>
        </div>

        <div className="space-y-1.5">
          {scoreSets.map(set => (
            <div
              key={set.id}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                set.id === activeSetId
                  ? 'bg-blue-50 border border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <input
                type="radio"
                checked={set.id === activeSetId}
                onChange={() => switchSet(set.id)}
                className="w-4 h-4 flex-shrink-0 cursor-pointer"
              />
              {editingSetId === set.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        saveEditName();
                      } else if (e.key === 'Escape') {
                        cancelEditName();
                      }
                    }}
                    className="flex-1 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 min-w-0"
                    placeholder="データセット名"
                    style={{ fontSize: '16px' }}
                    autoFocus
                  />
                  <button
                    onClick={saveEditName}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex-shrink-0"
                    title="保存"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={cancelEditName}
                    className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex-shrink-0"
                    title="キャンセル"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm flex-1 truncate min-w-0">{set.name}</span>
                  {set.id === activeSetId && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          startEditName(set.id, set.name);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="名前変更"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteSet(set.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-sm text-gray-700">
        理系型の人は、社会②を0または空欄にしてください。
        <br />
        文系型の人は、理科基礎の合計を理科①に入力してください。
      </div>

      {SUBJECTS.map(s => (
        <div key={s.key} className="bg-white rounded-lg border p-2.5 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">{s.label}</label>
            <span className="text-xs text-gray-500">/ {s.max}点</span>
          </div>
          <input
            type="number"
            inputMode="numeric"
            value={scores[s.key] ?? ''}
            onChange={e => updateScore(s.key, e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ fontSize: '16px' }}
          />
        </div>
      ))}

      <div className="text-xs text-gray-500 text-center pt-2">
        入力は自動保存されます。
        <br />
        サイト内の全ての入力データは、あなたの端末のブラウザ内に保存され、サーバーには一切送信されません。
        <br />
        MITライセンスで提供されています。{' '}
        <a
          href="https://github.com/Stasshe/Kyoute-Keisya-calc"
          className="text-blue-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHubリポジトリはこちら
        </a>
        。
        <br />© 2025 Stasshe/Roughfts. All rights reserved.
      </div>
    </div>
  );
}