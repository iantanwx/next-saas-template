import { Toaster } from '~/components/ui/toaster';
import { siteConfig } from '~/config/site';
import '~/styles/global.css';
import { TrpcProvider } from '@superscale/trpc/react';
import cn from 'classnames';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(inter.className, 'bg-background font-sans antialiased')}
      >
        <TrpcProvider>{children}</TrpcProvider>
        <Toaster />
      </body>
    </html>
  );
}
