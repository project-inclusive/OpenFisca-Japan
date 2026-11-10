import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default () => {
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
    plugins: [react(), htmlPlugin()],
    build: {
      // Vite 8 raised the default target; preserve Vite 2.9's browser support.
      target: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    },
    test: {
      projects: [
        {
          test: {
            name: 'unit',
            environment: 'node',
            include: ['src/**/*.{test,spec}.{ts,tsx}'],
            exclude: ['src/**/*.browser.test.{ts,tsx}'],
            setupFiles: ['./src/testSetup.ts'],
          },
        },
      ],
    },
    base: process.env.GITHUB_PAGES
      ? '/OpenFisca-Japan/' // レポジトリ名を設定
      : '/',
  });
};
