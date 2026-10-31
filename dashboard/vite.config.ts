import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  // index.htmlの「%=」「%」で囲われた部分を環境変数値で置換するための処理
  //   例: <title>%=ENV_NAME%</title> -> <title>ENV_NAME</title>
  const env = { ...process.env };
  // console.log('YADOKARI_GTM_ID:' + env['YADOKARI_GTM_ID']); // デバッグ用
  const htmlPlugin = () => ({
    name: 'html-transform',
    transformIndexHtml: (html: string): string =>
      html.replace(/%=(.*?)%/g, (match, p1) => env[p1] ?? match),
  });

  return defineConfig({
    // Fast Refresh needs Vite's browser preamble; Vitest runs without HTML.
    plugins: [react({ fastRefresh: mode !== 'test' }), htmlPlugin()],
    test: {
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      setupFiles: ['./src/testSetup.ts'],
    },
    base: process.env.GITHUB_PAGES
      ? 'OpenFisca-Japan' // レポジトリ名を設定
      : '/',
  });
};
