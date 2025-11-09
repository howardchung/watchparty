var webpack = require('webpack')

module.exports = {
  entry: {
    app: ['./example/main.js']
  },
  output: {
    filename: 'output.js',
    pathinfo: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015']
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin()
  ]
}
