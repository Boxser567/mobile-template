import eslint from '@eslint/js';
import tsESLint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'node_modules/',
      'dist/',
      '**/*.test.js', // 使用通配符语法
      '!**/.eslintrc*',
      'node_modules*',
      'dist',
      '*.svg',
      '*.ico',
      '*.json',
      '.gitignore',
      '*.md',
      '*.log',
      '*.lock',
      'stats.html',
      'language.js',
      '.commitlintrc.js',
      'vite.config.mjs',
      'postcss.config.js',
      'tailwind.config.js',
      'cz.config.js',
      '*.yaml',
    ],
    settings: {
      react: {
        pragma: 'React',
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          // 优先从 `tsconfig.json` 读取别名
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      '@typescript-eslint': tsESLint,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // 关联 TS 配置
        tsconfigRootDir: import.meta.dirname, // 基于 ESM 的路径写法
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        NodeJS: 'readonly',
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tsESLint.configs['eslint-recommended'].rules,
      ...tsESLint.configs.recommended.rules,
      // ...tsESLint.configs['recommended-type-checked'].rules,
      ...react.configs['jsx-runtime'].rules,
      // TypeScript 规则
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/consistent-type-imports': 'warn',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [['^.*\\u0000$'], ['^\\u0000'], ['^@?\\w'], ['^'], ['^\\.']],
        },
      ],
      'simple-import-sort/exports': 'warn',
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
      'import/no-duplicates': 'warn',
      'import/newline-after-import': 'warn',
      'newline-after-var': 'warn',
      'space-before-function-paren': 'off',
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'block' },
        { blankLine: 'always', prev: 'block', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },
  prettierConfig,
];
