import { resolve } from 'path';

export default (config) => {
  config.set({
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARNING,
    autoWatch: true,
    singleRun: false,
    browsers: [ 'Chrome' ],
    frameworks: [ 'chai', 'mocha' ],
    files: [
      'tests.bundle.js',
    ],

    preprocessors: {
      'tests.bundle.js': [ 'webpack', 'sourcemap' ]
    },

    plugins: [
      'karma-chai',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-sourcemap-loader',
      'karma-webpack',
      'karma-spec-reporter',
    ],

    reporters: [ 'spec' ],

    webpack: {
      mode: 'production',
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: resolve('./node_modules'),
            query: {
              presets: [
                '@babel/env',
              ],
              plugins: [
                '@babel/transform-runtime',
              ]
            }
          }
        ]
      },
      resolve: {
        extensions: [ '.js', '.jsx' ],
        modules: resolve(`./node_modules`)
      },
      performance: {
        hints: false
      },
      devtool: 'inline-source-map',
    },
    webpackMiddleware: {
      noInfo: true,
    },
  })
};
