import type { Config } from 'tailwindcss';
import baseConfig from '@superscale/twconfig';

export default {
  ...baseConfig,
  content: [...(baseConfig.content as Array<string>), './src/**/*.{ts,tsx}'],
} satisfies Config;
