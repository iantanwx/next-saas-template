'use client';

import type { UserWithMemberships } from '@superscale/crud/types';
import { createClient } from '@superscale/lib/supabase/browser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@superscale/ui/components/dropdown-menu';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { UserAvatar } from './user-avatar';

interface Props {
  user: UserWithMemberships;
}

export function AccountNav({ user }: Props) {
  const { organization } = useParams();
  const router = useRouter();
  const supabase = createClient();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{ name: user.name || null, image: user.avatarUrl || null }}
          className="h-8 w-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="text-muted-foreground w-[200px] truncate text-sm">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${organization}`}>Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${organization}/billing`}>Billing</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${organization}/settings`}>Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={async (event) => {
            event.preventDefault();
            await supabase.auth.signOut();
            router.push('/auth/sign-in');
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
