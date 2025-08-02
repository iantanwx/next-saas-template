import type { KnownIcon } from '@/components/util/icons';

export type Social = {
  name: string;
  icon: KnownIcon;
  href: string;
};

export const socials: readonly Social[] = [
  {
    name: 'GitHub',
    icon: 'github',
    href: 'https://github.com/superscalehq/superscale',
  },
  {
    name: 'Twitter',
    icon: 'twitter',
    href: 'https://twitter.com/superscaledev',
  },
  {
    name: 'Discord',
    icon: 'discord',
    href: 'https://discord.gg/6DP27VUz',
  },
] as const;
