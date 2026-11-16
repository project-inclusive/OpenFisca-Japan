import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default defineConfig({
  files: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
  extends: [
    react.configs.flat.recommended,
    tseslint.configs.recommendedTypeChecked,
    prettier,
  ],
  languageOptions: {
    globals: { ...globals.browser, ...globals.es2021 },
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
  },
});
