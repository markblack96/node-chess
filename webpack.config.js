const path = require('path');

module.exports = {
  entry: {app:'./src/app.js', room: './src/room.js'},
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'public')
  },
  devServer: {
    contentBase: path.join(__dirname, 'public')
  },
  module: {
    rules: [{
      loader: 'babel-loader',
      test: /\.js$/,
      exclude: /node_modules/
    }]
  },
  mode: 'development'
};
