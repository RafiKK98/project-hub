/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off', // handled by TypeScript
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]
