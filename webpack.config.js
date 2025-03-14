const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  const plugins = [
    new HtmlWebpackPlugin({
      template: './client/index.html',
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      } : false
    })
  ];
  
  return {
    entry: './client/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].bundle.js',
      publicPath: '/',
      clean: true // Clean the output directory before emit
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              cacheDirectory: true // Enable babel caching
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    plugins,
    devServer: {
      historyApiFallback: true,
      port: 3000,
      hot: true, // Enable hot module replacement
      proxy: [
        {
          context: ['/api', '/login', '/callback'],
          target: 'http://localhost:8888'
        }
      ]
    },
    // Optimization configuration
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction, // Remove console.log in production
              drop_debugger: isProduction
            },
            output: {
              comments: false // Remove comments
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ],
      // Split chunks for better caching
      splitChunks: {
        chunks: 'all',
        name: false,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      },
      // Keep the runtime chunk separated to enable long term caching
      runtimeChunk: 'single'
    },
    // Source maps
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
    // Performance hints
    performance: {
      hints: isProduction ? 'warning' : false
    },
    // Cache
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename] // Invalidate cache when webpack config changes
      }
    }
  };
}; 