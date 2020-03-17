module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'vue/no-side-effects-in-computed-properties': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
    }
}
