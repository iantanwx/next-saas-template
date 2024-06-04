import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

import * as React from 'react';

interface MagicLinkEmailProps {
  link?: string;
  organizationName?: string;
  inviterName?: string;
  inviterEmail?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const InvitationEmail = ({
  link = 'https://superscale.app',
  organizationName = 'Scribbler',
  inviterName = 'Ian',
  inviterEmail = 'ian@scribbler.so',
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Join {organizationName} on Superscale</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
          <Section className="mt-[32px]">
            <Img
              src={`${baseUrl}/static/logo.png`}
              width={80}
              height={80}
              className="mx-auto"
            />
          </Section>
          <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
            Join {organizationName} on Superscale
          </Heading>
          <Text className="text-[14px] leading-[24px] text-black">Hello,</Text>
          <Text className="text-[14px] leading-[24px] text-black">
            <strong>{inviterName}</strong> (
            <Link
              href={`mailto:${inviterEmail}`}
              className="text-blue-600 no-underline"
            >
              {inviterEmail}
            </Link>
            ) has invited you to the <strong>{organizationName}</strong> team on{' '}
            <strong>Superscale</strong>.
          </Text>
          <Section className="mb-[32px] mt-[32px] text-center">
            <Button
              className="rounded bg-[#000000] px-6 py-4 text-center text-[12px] font-semibold text-white no-underline"
              href={link}
            >
              Join {organizationName}
            </Button>
          </Section>
          <Text>
            Alternatively, you can visit the URL in your browser directly:
          </Text>
          <Link
            href={link}
            className="text-[14px] leading-[24px] text-blue-600 no-underline"
          >
            {link}
          </Link>
          <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
          <Text className="text-[12px] leading-[24px] text-[#666666]">
            If you were not expecting this invitation, you can ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default InvitationEmail;
