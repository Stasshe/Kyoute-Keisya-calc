'use client';

import { Copy, Download, Upload } from 'lucide-react';
import { useState } from 'react';

import { University } from '@/data/universities';

type Props = {
  universities: University[];
  onImport: (universities: University[]) => void;
};

export default function WeightExportImport({ universities, onImport }: Props) {
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExport = async () => {
    const customUniversities = universities.filter(u => u.id.startsWith('custom_'));
    const exportData = JSON.stringify(customUniversities, null, 2);

    try {
      await navigator.clipboard.writeText(exportData);
      alert('配点データをクリップボードにコピーしました！');
      setShowExport(false);
    } catch (err) {
      alert('クリップボードへのコピーに失敗しました。ブラウザの設定を確認してください。');
    }
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        alert('無効なデータ形式です。配列形式のJSONを入力してください。');
        return;
      }

      const validUniversities: University[] = [];
      for (const item of parsed) {
        if (
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          Array.isArray(item.faculties)
        ) {
          validUniversities.push(item as University);
        }
      }

      if (validUniversities.length === 0) {
        alert('有効な大学データが見つかりませんでした。');
        return;
      }

      onImport(validUniversities);
      setImportText('');
      setShowImport(false);
      alert(`${validUniversities.length}件の大学データをインポートしました！`);
    } catch (err) {
      alert('データの解析に失敗しました。正しいJSON形式で入力してください。');
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-3 space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">配点データの管理</h3>

      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          エクスポート
        </button>
        <button
          onClick={() => setShowImport(!showImport)}
          className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Upload className="w-4 h-4" />
          インポート
        </button>
      </div>

      {showExport && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <p className="text-xs text-gray-600 mb-2">
            以下のデータがクリップボードにコピーされました：
          </p>
          <textarea
            readOnly
            value={JSON.stringify(
              universities.filter(u => u.id.startsWith('custom_')),
              null,
              2
            )}
            className="w-full h-32 px-2 py-1 text-xs font-mono border rounded bg-white"
            style={{ fontSize: '12px' }}
          />
          <button
            onClick={() => setShowExport(false)}
            className="mt-2 w-full px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            閉じる
          </button>
        </div>
      )}

      {showImport && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <p className="text-xs text-gray-600 mb-2">
            エクスポートしたJSON形式のデータを貼り付けてください：
          </p>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder='[{"id": "custom_...", "name": "..."}]'
            className="w-full h-32 px-2 py-1 text-xs font-mono border rounded"
            style={{ fontSize: '12px' }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleImport}
              className="flex-1 px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              インポート実行
            </button>
            <button
              onClick={() => {
                setShowImport(false);
                setImportText('');
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 pt-2">
        <p>
          ※ エクスポート：カスタム追加した大学の配点データをクリップボードにコピーします
        </p>
        <p>※ インポート：他の端末でエクスポートしたデータを読み込みます</p>
      </div>
    </div>
  );
}
