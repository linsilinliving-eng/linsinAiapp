/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  serverExternalPackages: ['knex', 'mysql2'],
  turbopack: {},
  webpack: (config) => {
    config.ignoreWarnings = [
        { module: /node_modules\/knex\/lib\/dialects/ },
    ];
    return config;
  },
};

module.exports = nextConfig;