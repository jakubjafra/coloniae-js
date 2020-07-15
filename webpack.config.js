const path = require('path');

module.exports = {
  mode: 'development',
  entry: './app/scripts/main.js',
  output: {
    path: path.resolve(__dirname, './app/build'),
    filename: 'index.js',
  },
  resolve: {
    modules: ['node_modules', './app/externals'],
  },
  devServer: {
    watchContentBase: true,
    contentBase: path.join(__dirname, './app'),
    contentBasePublicPath: '/',
  },
};
