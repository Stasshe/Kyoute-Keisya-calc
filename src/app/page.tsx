'use client';

import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">共通テスト 傾斜配点計算</h1>
          <p className="text-sm text-muted-foreground mt-1">
            スコアを入力して、大学ごとの傾斜配点合計を計算します。入力は自動保存されます。
          </p>
        </header>

        <section>
          <Calculator />
        </section>
      </div>
    </main>
  );
}
