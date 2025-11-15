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

// Hierarchical data: university -> faculties -> departments -> weights
export type Department = { id: string; name: string; weights: Weights };
export type Faculty = { id: string; name: string; departments: Department[] };
export type University = { id: string; name: string; faculties: Faculty[] };

export const DEFAULT_UNIVERSITIES: University[] = [];
