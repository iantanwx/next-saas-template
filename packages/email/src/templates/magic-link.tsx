import {
  Body,
  Container,
  Section,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Tailwind,
  Text,
  Button,
  Hr,
} from '@react-email/components';

import * as React from 'react';

interface MagicLinkEmailProps {
  link?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const MagicLinkEmail = ({
  link = 'https://superscale.app',
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Sign in to Superscale with this magic link</Preview>
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
            Login to <strong>Superscale</strong>
          </Heading>
          <Text>
            Click the link below to log in. It will only be valid for a short
            time.
          </Text>
          <Section className="mb-[32px] mt-[32px] text-center">
            <Button
              className="rounded bg-[#000000] px-6 py-4 text-center text-[12px] font-semibold text-white no-underline"
              href={link}
            >
              Login
            </Button>
          </Section>
          <Text>
            Alternatively, you can visit the URL in your browser directly:
          </Text>
          <Link href={link} className="text-blue-600 no-underline">
            {link}
          </Link>
          <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
          <Text className="text-[12px] leading-[24px] text-[#666666]">
            This email was sent because a login with your email was requested.
            If you didn&apos;t try to login, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default MagicLinkEmail;
