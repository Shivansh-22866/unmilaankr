import type { NextConfig } from 'next';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^zlib-sync$/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /^bufferutil$/ })
    );
    return config;
  }
};

export default nextConfig;
