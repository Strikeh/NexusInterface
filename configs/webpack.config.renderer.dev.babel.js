import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import baseConfig from './webpack.config.base.renderer';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import { babelLoaderRenderer } from './babelLoaderConfig';

CheckNodeEnv('development');

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/`;
const dllPath = path.resolve(process.cwd(), 'dll');
const manifest = path.resolve(dllPath, 'renderer.json');

export default merge(baseConfig, {
  mode: 'development',

  devtool: 'eval-source-map',

  entry: {
    'renderer.dev': './src/index',
    'keyboard.dev': './src/keyboard/index.js',
  },

  output: {
    publicPath,
    filename: '[name].js',
  },

  module: {
    rules: [
      babelLoaderRenderer(true),
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            mimetype: 'font/woff2',
            outputPath: 'fonts',
          },
        },
      },
    ],
  },

  optimization: {
    moduleIds: 'named',
  },

  plugins: [
    new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require(manifest),
      sourceType: 'var',
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    new ReactRefreshWebpackPlugin(),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: true,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});
