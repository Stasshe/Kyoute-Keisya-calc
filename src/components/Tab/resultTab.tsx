'use client';

import { Award, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Department, SUBJECTS } from '@/data/universities';

type Props = {
  scores: Record<string, number>;
  department?: Department;
  universityName?: string;
  facultyName?: string;
};

export default function ResultsTab({
  scores,
  department,
  universityName,
  facultyName
}: Props) {
  // トグル状態: 'none' | 'social2' | 'sci2'
  const [ignoreSubject, setIgnoreSubject] = useState<'none' | 'social2' | 'sci2'>(() => {
    try {
      if (typeof window === 'undefined') return 'none';
      const v = localStorage.getItem('ignoreSubject');
      return v === 'social2' || v === 'sci2' || v === 'none' ? (v as 'none' | 'social2' | 'sci2') : 'none';
    } catch (e) {
      return 'none';
    }
  });

  // ignoreSubject が変わったら localStorage に保存
  useEffect(() => {
    try {
      localStorage.setItem('ignoreSubject', ignoreSubject);
    } catch (e) {
      // ignore write errors silently
    }
  }, [ignoreSubject]);

  // 教科ごとの詳細データを計算
  const subjectDetails = useMemo(() => {
    if (!department) return [];

    return SUBJECTS.map(s => {
      // 無視する教科の場合はスコアと配点を0にする
      const shouldIgnore =
        (ignoreSubject === 'social2' && s.key === 'social2') ||
        (ignoreSubject === 'sci2' && s.key === 'sci2');

      const rawScore = shouldIgnore ? 0 : Number(scores[s.key] ?? 0) || 0;
      const weight = shouldIgnore ? 0 : Number(department.weights[s.key] ?? 0) || 0;
      const percentage = s.max > 0 ? (rawScore / s.max) * 100 : 0;
      const weighted = s.max > 0 ? (rawScore / s.max) * weight : 0;

      return {
        key: s.key,
        label: s.label,
        rawScore,
        maxScore: s.max,
        percentage,
        weight,
        weighted,
        isIgnored: shouldIgnore,
      };
    });
  }, [scores, department, ignoreSubject]);

  // 合計点の計算（無視する教科を除外）
  const rawTotal = useMemo(() => {
    return subjectDetails.reduce((sum, s) => sum + s.rawScore, 0);
  }, [subjectDetails]);

  const maxPossible = useMemo(() => {
    return SUBJECTS.reduce((sum, s) => {
      const shouldIgnore =
        (ignoreSubject === 'social2' && s.key === 'social2') ||
        (ignoreSubject === 'sci2' && s.key === 'sci2');
      return sum + (shouldIgnore ? 0 : s.max);
    }, 0);
  }, [ignoreSubject]);

  const totalPercentage = useMemo(() => {
    return maxPossible > 0 ? (rawTotal / maxPossible) * 100 : 0;
  }, [rawTotal, maxPossible]);

  // 換算後合計点の計算
  const weightedTotal = useMemo(() => {
    return subjectDetails.reduce((sum, s) => sum + s.weighted, 0);
  }, [subjectDetails]);

  // 分野別集計（文系・理系・その他）
  const categoryData = useMemo(() => {
    const categories = {
      humanities: {
        name: '文系科目',
        subjects: ['social1', 'social2', 'japanese'],
        total: 0,
        weighted: 0,
      },
      science: {
        name: '理系科目',
        subjects: ['sci1', 'sci2', 'math1', 'math2'],
        total: 0,
        weighted: 0,
      },
      language: { name: '英語', subjects: ['engR', 'engL'], total: 0, weighted: 0 },
      three: {
        name: '3科目',
        subjects: ['engR', 'engL', 'japanease', 'math1', 'math2'],
        total: 0,
        weighted: 0,
      },
    };

    Object.entries(categories).forEach(([, cat]) => {
      cat.subjects.forEach(key => {
        const detail = subjectDetails.find(d => d.key === key);
        if (detail) {
          cat.total += detail.rawScore;
          cat.weighted += detail.weighted;
        }
      });
    });

    return Object.values(categories);
  }, [subjectDetails]);

  // レーダーチャート用データ
  const radarData = useMemo(() => {
    return subjectDetails
      .filter(s => !s.isIgnored)
      .map(s => ({
        subject: s.label,
        得点率: Math.round(s.percentage * 10) / 10,
        配点: s.weight,
      }));
  }, [subjectDetails]);

  // 棒グラフ用データ（上位5教科）
  const topSubjects = useMemo(() => {
    return [...subjectDetails]
      .filter(s => s.weight > 0 && !s.isIgnored)
      .sort((a, b) => b.weighted - a.weighted)
      .slice(0, 6);
  }, [subjectDetails]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  if (!department) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>大学・学部・学科を選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 pb-6">
      {/* トグルスイッチ */}
      <div className="bg-white rounded-lg border shadow-sm p-3">
        <div className="text-xs text-gray-600 mb-2 font-medium">科目選択（どちらかを無視）</div>
        <div className="flex gap-2">
          <button
            onClick={() => setIgnoreSubject('none')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              ignoreSubject === 'none'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            両方使う
          </button>
          <button
            onClick={() => setIgnoreSubject('social2')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              ignoreSubject === 'social2'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            社会②を無視
          </button>
          <button
            onClick={() => setIgnoreSubject('sci2')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              ignoreSubject === 'sci2'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            理科②を無視
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" />
            <div className="text-xs opacity-90">換算後得点</div>
          </div>
          <div className="text-2xl font-bold">{Math.round(weightedTotal * 100) / 100}</div>
          <div className="text-xs opacity-75 mt-1">
            {universityName} {facultyName}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-3 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" />
            <div className="text-xs opacity-90">素点合計</div>
          </div>
          <div className="text-2xl font-bold">{rawTotal}</div>
          <div className="text-xs opacity-75 mt-1">
            / {maxPossible}点 ({Math.round(totalPercentage)}%)
          </div>
        </div>
      </div>

      {/* 分野別得点 */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900 text-sm">分野別得点</h3>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {categoryData.map((cat, idx) => {
            const maxCat = cat.subjects.reduce((sum, key) => {
              const subj = SUBJECTS.find(s => s.key === key);
              const shouldIgnore =
                (ignoreSubject === 'social2' && key === 'social2') ||
                (ignoreSubject === 'sci2' && key === 'sci2');
              return sum + (shouldIgnore ? 0 : subj?.max || 0);
            }, 0);
            const percentage = maxCat > 0 ? (cat.total / maxCat) * 100 : 0;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700">{cat.name}</span>
                  <span className="text-gray-600">
                    {cat.total}/{maxCat} ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                {cat.weighted > 0 && (
                  <div className="text-xs text-gray-500">
                    換算後: {Math.round(cat.weighted * 100) / 100}点
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 教科別詳細 */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900 text-sm">教科別詳細</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">教科</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">得点</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">得点率</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">配点</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">換算後</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subjectDetails.map((s, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-gray-50 ${s.isIgnored ? 'opacity-40 bg-gray-50' : ''}`}
                >
                  <td className="px-3 py-2.5 font-medium text-gray-900">
                    {s.label}
                    {s.isIgnored && <span className="ml-1 text-xs text-red-500">(無視)</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-700">
                    {s.rawScore}/{s.maxScore}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.percentage >= 80
                          ? 'bg-green-100 text-green-700'
                          : s.percentage >= 60
                            ? 'bg-blue-100 text-blue-700'
                            : s.percentage >= 40
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {Math.round(s.percentage)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{s.weight}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-blue-600">
                    {Math.round(s.weighted * 100) / 100}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 py-2.5 text-gray-900">合計</td>
                <td className="px-3 py-2.5 text-right text-gray-900">{rawTotal}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {Math.round(totalPercentage)}%
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-gray-900">
                  {subjectDetails.reduce((sum, s) => sum + s.weight, 0)}
                </td>
                <td className="px-3 py-2.5 text-right text-blue-600 text-base">
                  {Math.round(weightedTotal * 100) / 100}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* レーダーチャート */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b">
          <h3 className="font-semibold text-gray-900 text-sm">得点率分析</h3>
        </div>
        <div className="p-3">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                name="得点率 (%)"
                dataKey="得点率"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 配点上位教科 */}
      {topSubjects.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b">
            <h3 className="font-semibold text-gray-900 text-sm">換算得点上位教科</h3>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topSubjects} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="label" type="category" width={60} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${Math.round(value * 100) / 100}点`, '換算得点']}
                />
                <Bar dataKey="weighted" radius={[0, 4, 4, 0]}>
                  {topSubjects.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* アドバイス */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-3">
        <div className="flex gap-2">
          <div className="text-amber-600 mt-0.5">💡</div>
          <div className="flex-1 text-xs text-gray-700 space-y-1">
            <p className="font-medium text-amber-900">得点アップのヒント</p>
            {totalPercentage < 70 && <p>• 全体的な基礎力の底上げを目指しましょう</p>}
            {subjectDetails.some(s => s.weight > 0 && s.percentage < 60 && !s.isIgnored) && (
              <p>• 配点が高い教科で得点率が低いものを優先的に対策しましょう</p>
            )}
            {totalPercentage >= 80 && <p>• 素晴らしい成績です！この調子で本番も頑張りましょう</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
