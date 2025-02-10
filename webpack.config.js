const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    content: './src/content/content.js',
    popup: './src/popup/popup.js',
    options: './src/options/options.js',
    sidepanel: './src/sidepanel/sidepanel.jsx', // Use a .jsx file for React
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js', // Generates background.js, content.js, etc.
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/assets', to: 'assets' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'src/options/options.html', to: 'options.html' },
        { from: 'src/sidepanel/sidepanel.html', to: 'sidepanel.html' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Match .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Transpile ES6 and JSX
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve .js and .jsx extensions
  },
  mode: 'development', // Change to 'production' for optimized builds
};
