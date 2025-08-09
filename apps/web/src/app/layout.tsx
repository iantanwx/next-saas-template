import { siteConfig } from '@/config/site';
import { clientConfig } from '@/lib/config';
import { getCurrentSession } from '@superscale/lib/auth';
import { TrpcProvider } from '@superscale/trpc/react';
import { Toaster } from '@superscale/ui/components/toaster';
import '@superscale/ui/globals.css';
import cn from 'classnames';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Z } from '@superscale/zero/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'SaaS',
    'Code',
    'developer',
    'next.js',
    'react',
    'app router',
    'shadcn-ui',
    'indie hacker',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: siteConfig.name,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/og.jpg`],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/og.jpg`],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await getCurrentSession();
  return (
    <html lang="en">
      <body
        className={cn(inter.className, 'bg-background font-sans antialiased')}
      >
        <Z
          user={user}
          server={clientConfig.NEXT_PUBLIC_ZERO_URL}
          session={session}
        >
          <TrpcProvider>{children}</TrpcProvider>
        </Z>
        <Toaster />
      </body>
    </html>
  );
}
