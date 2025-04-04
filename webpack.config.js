const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add dotenv-webpack plugin
  config.plugins.push(
    new Dotenv({
      path: '.env',
      safe: true,
      systemvars: true,
      silent: true,
    })
  );

  return config;
}; 