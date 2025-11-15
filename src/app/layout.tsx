import fs from 'fs';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import path from 'path';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// basePath を next.config から環境変数で受け取る (next.config.ts で設定済み)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// manifest を同期的に読み込む（layout はサーバーコンポーネントなので問題なし）
let manifest: any = {};
try {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  const raw = fs.readFileSync(manifestPath, 'utf8');
  manifest = JSON.parse(raw || '{}');
} catch (e) {
  manifest = {};
}

export const metadata: Metadata = {
  title: manifest.name || 'Create Next App',
  description:
    typeof manifest.description === 'string' && manifest.description
      ? manifest.description
      : '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appName = manifest.short_name || manifest.name || metadata.title;
  const themeColor = manifest.theme_color || '#ffffff';
  const icons: Array<any> = Array.isArray(manifest.icons) ? manifest.icons : [];

  const largestIcon =
    icons.reduce((prev, cur) => {
      try {
        const prevSize = Number((prev.sizes || '').split('x')[0]) || 0;
        const curSize = Number((cur.sizes || '').split('x')[0]) || 0;
        return curSize > prevSize ? cur : prev;
      } catch (e) {
        return prev;
      }
    }, icons[0]) || null;

  const hrefWithBase = (p: string) => `${basePath || ''}/${p.replace(/^\//, '')}`;

  return (
    <html lang="ja">
      <head>
        <meta name="application-name" content={appName} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={appName} />
        <meta name="description" content={metadata.description ?? ''} />
        <meta name="theme-color" content={themeColor} />

        <link rel="manifest" href={`${basePath || ''}/manifest.json`} />
        <link rel="shortcut icon" href={hrefWithBase('favicon.ico')} />

        {icons.map((icon, idx) => (
          <link
            key={idx}
            rel={icon.purpose && icon.purpose.includes('maskable') ? 'icon' : 'icon'}
            href={hrefWithBase(icon.src || '')}
            sizes={icon.sizes}
            type={icon.type}
          />
        ))}

        {largestIcon ? (
          <link rel="apple-touch-icon" href={hrefWithBase(largestIcon.src || '')} />
        ) : null}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
