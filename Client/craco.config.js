const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Critical dependency: the request of a dependency is an expression/,
      ];
      return webpackConfig;
    },
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // your middlewares...
      return middlewares;
    },
  },
};