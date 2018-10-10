const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');
const CONFIG = require('./config');
const path = require('path');

const PROD = CONFIG.environment.type == 'production';

module.exports = {
  mode: CONFIG.environment.type,

  entry: './client/components/App.jsx',

  output: {
    filename: 'App.js',
    path: path.resolve(__dirname, 'static/js')
  },

  resolve: {
    modules: [path.resolve(__dirname, 'client'), 'node_modules'],
    alias: {
      server: __dirname
    },
    extensions: ['.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'client/actions'),
          path.resolve(__dirname, 'client/components'),
          path.resolve(__dirname, 'client/constants'),
          path.resolve(__dirname, 'client/lib'),
          path.resolve(__dirname, 'client/reducers')
        ],
        exclude: /node_modules/,
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: [
                    'last 2 Chrome versions',
                    'last 2 Firefox versions',
                    'last 2 iOS versions',
                    'last 2 Android versions'
                  ]
                }
              }
            ],
            '@babel/preset-react'
          ]
        }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(CONFIG.environment.type)
      }
    }),
    PROD ? new CompressionPlugin({ filename: '[path].gz' }) : null
  ].filter(p => p !== null)
};
