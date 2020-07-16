const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

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
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      'window.jQuery': 'jquery',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'static', to: '.', context: './app/' },
        { from: 'imgs', to: 'imgs', context: './app/' },
      ],
    }),
  ],
};
