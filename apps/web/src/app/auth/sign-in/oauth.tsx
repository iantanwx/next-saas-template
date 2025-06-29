'use client';

import { Button } from '@superscale/ui/components/button';
import GoogleLogo from './google_logo.svg';
import { createClient } from '@superscale/lib/supabase/browser';

interface Props {
  invitationId?: string;
}

export default function Oauth({ invitationId }: Props) {
  return (
    <div>
      <Button
        className="w-full"
        onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: 'http://localhost:3000/api/auth/supabase/callback',
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              queryParams: { invitationId: invitationId ?? undefined },
            },
          });
        }}
      >
        <GoogleLogo className="mr-2 h-4 w-4" /> Login with Google
      </Button>
    </div>
  );
}
