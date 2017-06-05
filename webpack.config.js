var webpack = require('webpack');
var path = require('path');
var SRC_DIR = path.join(__dirname, '/reactJS');
var DIST_DIR = path.join(__dirname, '/public');

module.exports = {
  entry: `${SRC_DIR}/TableView.jsx`,
  output: {
    filename: 'bundle.js',
    path: DIST_DIR
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: SRC_DIR,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2017'],
          plugins: [
            ["transform-runtime"],
          ],
        },
      },
      { test: /\.(woff|png|jpg|gif)$/,
        include: SRC_DIR,
        loader: 'url-loader' 
      },
    ]
  }
};