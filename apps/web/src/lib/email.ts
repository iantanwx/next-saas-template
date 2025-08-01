import { sendEmail } from '@superscale/email';
import { baseUrl } from './utils';

export { sendEmail };

export function getInviteLink(inviteId: string) {
  return `${baseUrl()}/auth/invitation/${inviteId}`;
}
