import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as webpack from 'webpack';

// TODO: Use https://github.com/TypeStrong/typedoc and https://github.com/Microsoft/Typedoc-Webpack-Plugin
// tslint:disable-next-line:no-var-requires
// const TypedocWebpackPlugin = require('typedoc-webpack-plugin'); //

import * as path from 'path';

module.exports = {
  entry: {
    app: './index.tsx',
    example: './examples/example.tsx',
    tcontainer: './TContainer.tsx',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'configs', 'tsconfig.webpack.json'),
            context: __dirname,
          },
        },
      },
      {
        // Needed for Plotly.js: https://github.com/plotly/plotly.js#building-plotlyjs-with-webpack
        loader: 'ify-loader',
        test: /\.js$/,
      },
    ],
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      automaticNameDelimiter: '~',
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/,
        },
      },
      chunks: 'all',
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      maxSize: 0,
      minChunks: 1,
      minSize: 30000,
      name: true,
    },
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      chunks: ['app'],
      favicon: 'assets/favicons/favicon.ico',
      filename: 'app.html',
      inject: true,
      template: './index.html',
      title: 'Development',
    }),
    new HtmlWebpackPlugin({
      chunks: ['example'],
      favicon: 'assets/favicons/favicon.ico',
      filename: 'example.html',
      inject: true,
      template: './examples/example.html',
      title: 'Chell - Contact Map / NGL Example',
    }),
    new HtmlWebpackPlugin({
      chunks: ['tcontainer'],
      favicon: 'assets/favicons/favicon.ico',
      filename: 'TContainer.html',
      inject: true,
      template: './TContainer.html',
      title: 'TContainer',
    }),
    new CopyWebpackPlugin([
      {
        from: './assets',
        ignore: ['*.pdf'],
        to: './assets',
        toType: 'dir',
      },
    ]),
    new webpack.NamedModulesPlugin(),
  ],
  resolve: {
    alias: {
      '~chell-viz~': path.resolve(__dirname, './src'),
      '~chell-viz~/component': path.resolve(__dirname, './src/component'),
      '~chell-viz~/container': path.resolve(__dirname, './src/container'),
      '~chell-viz~/context': path.resolve(__dirname, './src/context'),
      '~chell-viz~/data': path.resolve(__dirname, './src/data'),
      '~chell-viz~/helper': path.resolve(__dirname, './src/helper'),
      '~chell-viz~/hoc': path.resolve(__dirname, './src/hoc'),
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, 'src'), path.join(__dirname, 'types'), 'node_modules'],
  },
};