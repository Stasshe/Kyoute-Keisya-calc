export type Weights = Record<string, number>;

export const SUBJECTS = [
  { key: 'social1', label: '社会①', max: 100 },
  { key: 'social2', label: '社会②', max: 100 },
  { key: 'japanese', label: '国語', max: 200 },
  { key: 'engR', label: '英語R', max: 100 },
  { key: 'engL', label: '英語L', max: 100 },
  { key: 'sci1', label: '理科①', max: 100 },
  { key: 'sci2', label: '理科②', max: 100 },
  { key: 'math1', label: '数学①', max: 100 },
  { key: 'math2', label: '数学②', max: 100 },
  { key: 'info', label: '情報', max: 100 },
];

// Example default universities. Weights are absolute numbers (実際の配点) used directly.
export const DEFAULT_UNIVERSITIES: Array<{ id: string; name: string; weights: Weights }> = [
  {
    id: 'default',
    name: '標準（等配点）',
    weights: SUBJECTS.reduce((acc, s) => {
      acc[s.key] = 100 / SUBJECTS.length; // distribute 100 equally
      return acc;
    }, {} as Weights),
  },
  {
    id: 'osaka',
    name: '大阪大学（例）',
    weights: {
      social1: 10,
      social2: 0,
      japanese: 40,
      engR: 37.5,
      engL: 12.5,
      sci1: 0,
      sci2: 0,
      math1: 0,
      math2: 0,
      info: 0,
    },
  },
];
