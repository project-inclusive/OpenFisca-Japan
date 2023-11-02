import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default () => {

  // index.htmlの「%=」「%」で囲われた部分を環境変数値で置換する
  //   例: <title>%=ENV_NAME%</title> -> <title>ENV_NAME</title>
  const env = { ...process.env };
  const htmlPlugin = () => ({
    name: 'html-transform',
    transformIndexHtml: (html: string): string =>
      html.replace(/%=(.*?)%/g, (match, p1) => env[p1] ?? match),
  });

  return defineConfig({
    plugins: [
      react(),
      htmlPlugin(),
    ],
    base: process.env.GITHUB_PAGES
      ? 'OpenFisca-Japan' // レポジトリ名を設定
      : '/',
  });
};