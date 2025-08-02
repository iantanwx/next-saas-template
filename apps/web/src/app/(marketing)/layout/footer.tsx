import cn from 'classnames';
import Link from 'next/link';
import { Icons } from '@/components/util/icons';
import { socials } from '@/config/socials';
import SocialIcon from './social-icon';

interface Props {
  className?: string;
}

export default function MarketingFooter({ className }: Props) {
  return (
    <footer className={cn('w-full ', className)}>
      <div className=" border-foreground mx-auto grid max-w-5xl grid-cols-4 border-t py-6">
        <div className="col-span-3 flex items-center justify-start">
          <div className="flex items-center justify-center gap-4">
            {socials.map((social) => (
              <SocialIcon key={social.icon} social={social} />
            ))}
          </div>
        </div>
        <div className="col-span-1 flex flex-row items-center justify-end gap-4">
          <SocialIcon
            social={{
              name: 'Mail',
              icon: 'mail',
              href: 'mailto:ian@superscale.dev',
            }}
          />
          <Link className="text-foreground" href="mailto:ian@superscale.dev">
            ian@superscale.dev
          </Link>
        </div>
      </div>
      <div className="bg-foreground w-full py-4">
        <div className="mx-auto grid max-w-4xl grid-cols-4">
          <div className="col-span-1 flex items-center justify-start">
            <span className="text-background text-sm">
              &copy; {new Date().getFullYear()} Superscale
            </span>
          </div>
          <div className="col-span-3 flex items-center justify-end gap-2">
            <Link className="text-background text-sm" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="text-background text-sm" href="/terms">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
