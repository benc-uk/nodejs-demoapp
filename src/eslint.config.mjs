import globals from 'globals'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['mochawesome-report/**/*'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
        ...globals.browser,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      'no-var': 'error',
      'no-console': 'off',
      'no-debugger': 'off',

      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: 'next|res|req',
        },
      ],

      'prefer-const': 'error',
    },
  },
]
