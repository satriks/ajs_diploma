const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'my-library',
    libraryTarget: 'umd' // exposes and know when to use module.exports or exports.
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
      { test: /\.html$/, use: [{ loader: 'html-loader' }] },
      { test: /\.txt$/, use: 'raw-loader' },
      { test: /\.css$/i, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
      {
        test: /\.(png|jpg|gif)$/i, dependency: { not: ['url'] }, use: [{ loader: 'url-loader', options: { limit: 8192 } }], type: 'javascript/auto',  // eslint-disable-line
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' }),

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })]

}
