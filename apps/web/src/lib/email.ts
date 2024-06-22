import { InvitationEmail } from '~/emails/invitation';
import { MagicLinkEmail } from '~/emails/magic-link';
import { Resend } from 'resend';
import { baseUrl } from './utils';

export const resend = new Resend(process.env.RESEND_API_KEY!);

export function getInviteLink(inviteId: string) {
  return `${baseUrl()}/auth/invitation/${inviteId}`;
}

const emails = {
  invitation: InvitationEmail,
  magicLink: MagicLinkEmail,
};

type Emails = keyof typeof emails;

type EmailData<T extends Emails> = Parameters<(typeof emails)[T]>[0];

export async function sendEmail<K extends Emails>(
  from: string,
  to: string,
  subject: string,
  email: K,
  data: EmailData<K>
) {
  const Email = emails[email];
  const emailInstance = Email(data);
  return resend.emails.send({
    from,
    to,
    subject,
    react: emailInstance,
  });
}
