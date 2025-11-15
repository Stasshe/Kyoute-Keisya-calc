'use client';

import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <main className="h-screen bg-background text-foreground p-6 pb-18 overflow-auto">
      <Calculator />
    </main>
  );
}
