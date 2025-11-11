import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      '*.config.js',
      '*.config.mjs',
      'eslint.config.mjs',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Direct access to process.env is not allowed. Use appEnv from 'src/config/env' instead.",
        },
        {
          selector: "NewExpression[callee.name='Error']",
          message:
            "Direct use of 'throw new Error' is not allowed. Use custom error classes from 'src/errors' instead.",
        },
        {
          selector: "ThrowStatement > CallExpression[callee.name='Error']",
          message:
            "Direct use of 'throw Error' is not allowed. Use custom error classes from 'src/errors' instead.",
        },
      ],
    },
  },
);
