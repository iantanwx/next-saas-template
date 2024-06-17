import baseConfig from '@superscale/twconfig';
import path from 'path';

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    ...(baseConfig.content as Array<string>),
    './src/**/*.{ts,tsx}',
    './contentlayer.config.ts',
    `${path.join(require.resolve('@superscale/ui'), '..')}/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@superscale/email'), '..')}/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@superscale/editor'), '..')}/**/*.{ts,tsx}`,
  ],
};
