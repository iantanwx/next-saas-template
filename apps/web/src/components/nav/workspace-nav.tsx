'use client';

import { Button } from '@superscale/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@superscale/ui/components/dropdown-menu';
import { UserWithMemberships } from '@superscale/crud/types';
import { createClient } from '@superscale/lib/supabase/browser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  user: UserWithMemberships;
}

export function WorkspaceNav({ user }: Props) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex h-12 flex-col items-start px-4 py-2"
          variant="ghost"
        >
          <span className="text-muted-foreground text-xs font-light">
            Signed in as:
          </span>
          <span className="text-sm font-semibold">{user?.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {user?.memberships.length > 0 ? (
          <>
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.memberships.map((membership) => (
              <DropdownMenuItem key={membership.organization.id}>
                <Link href={`/${membership.organization.slug}`}>
                  {membership.organization.name}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={async (e) => {
            e.preventDefault();
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/auth/sign-in');
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
