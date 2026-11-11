export default [
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly', fetch: 'readonly',
        performance: 'readonly', setTimeout: 'readonly', setInterval: 'readonly', URL: 'readonly',
        File: 'readonly', ClipboardItem: 'readonly', PointerEvent: 'readonly', AudioContext: 'readonly',
        webkitAudioContext: 'readonly', console: 'readonly', confirm: 'readonly', Image: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-redeclare': 'error'
    }
  }
];
