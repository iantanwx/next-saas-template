import baseConfig from '@superscale/ui/tailwind.config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...baseConfig,
  content: [
    ...(baseConfig.content as Array<string>),
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
