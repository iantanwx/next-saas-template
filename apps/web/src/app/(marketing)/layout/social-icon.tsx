import { Button } from '~/components/ui/button';
import { Icons } from '~/components/util/icons';
import { Social } from '~/config/socials';
import Link from 'next/link';

type Props = {
  social: Social;
};

export default function SocialIcon({ social }: Props) {
  const Icon = Icons[social.icon];
  return (
    <Button
      className="border-foreground hover:bg-transparent"
      variant="outline"
      size="icon"
      asChild
    >
      <Link href={social.href} target="_blank" rel="noreferrer">
        <Icon className="h-4 w-4" />
      </Link>
    </Button>
  );
}
