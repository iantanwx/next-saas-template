import { withAxiom } from 'next-axiom';
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
export default {
  images: {
    remotePatterns: [{ hostname: 'images.unsplash.com' }],
  },
  webpack(config) {
    // see https://github.com/vercel/next.js/issues/48177
    // Configures webpack to handle SVG files with SVGR. SVGR optimizes and transforms SVG files
    // into React components. See https://react-svgr.com/docs/next/

    // Grab the existing rule that handles SVG imports
    // @ts-ignore - rules is a private property that is not typed
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  transpilePackages: [
    '@superscale/crud',
    '@superscale/trpc',
    '@superscale/lib',
    '@superscale/email',
    '@superscale/editor',
    '@superscale/ui',
  ],
};

// const axiomConfig = withAxiom(nextConfig);
//
// const sentryConfig = {
//   // For all available options, see:
//   // https://github.com/getsentry/sentry-webpack-plugin#options
//   // Suppresses source map uploading logs during build
//   silent: true,
//   org: 'scribblerdotso',
//   project: 'superscale',
// };
//
// const sentryWebpackConfig = {
//   // For all available options, see:
//   // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
//
//   // Upload a larger set of source maps for prettier stack traces (increases build time)
//   widenClientFileUpload: true,
//
//   // Transpiles SDK to be compatible with IE11 (increases bundle size)
//   transpileClientSDK: true,
//
//   // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
//   tunnelRoute: '/monitoring',
//
//   // Hides source maps from generated client bundles
//   hideSourceMaps: true,
//
//   // Automatically tree-shake Sentry logger statements to reduce bundle size
//   disableLogger: true,
// };
//
// const config = withSentryConfig(axiomConfig, sentryConfig, sentryWebpackConfig);
//
// export default config;
