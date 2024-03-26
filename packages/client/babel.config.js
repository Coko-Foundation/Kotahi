module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'babel-plugin-parameter-decorator',
    'babel-plugin-styled-components',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
}
