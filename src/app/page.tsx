'use client';

import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">共通テスト 傾斜配点計算</h1>
        </header>

        <section>
          <Calculator />
        </section>
      </div>
    </main>
  );
}
