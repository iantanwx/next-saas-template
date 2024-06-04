'use server';

import { sendEmail } from '@superscale/email';
import { getMagicLink } from '@superscale/lib/auth/authn';
import { redirect } from 'next/navigation';

export async function signInWithEmail(email: string, invitationId?: string) {
  try {
    const link = await getMagicLink(email, invitationId);
    await sendEmail(
      'notifications@transactional.superscale.app',
      email,
      'Sign in to Superscale',
      'magicLink',
      {
        link,
      }
    );
  } catch (error) {
    console.error('Error generating magic link', error);
    redirect('/error');
  }
}
