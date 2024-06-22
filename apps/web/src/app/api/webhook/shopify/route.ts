import { prisma } from '~/lib/db';
import { logger } from '~/lib/logger';
import { shopify } from '~/lib/shopify';
import { IntegrationProvider } from '@prisma/client';
import { WebhookValidationErrorReason } from '@shopify/shopify-api';

export async function POST(req: Request) {
  const body = await req.text();
  logger.info('processing webhook: ', { body });
  const res = await shopify.webhooks.validate({
    rawBody: body,
    rawRequest: req,
  });

  if (!res.valid) {
    if (res.reason === WebhookValidationErrorReason.InvalidHmac) {
      logger.error('Webhook HMAC validation failed', res);
      return new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      });
    } else {
      logger.error('Webhook validation failed', res);
      return new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }
  }
  // delete the integration
  await prisma.integration.delete({
    where: {
      externalId_integrationProvider: {
        externalId: res.domain,
        integrationProvider: IntegrationProvider.SHOPIFY,
      },
    },
  });

  logger.info('deleted integration', {
    externalId: res.domain,
    integrationProvider: IntegrationProvider.SHOPIFY,
  });

  return new Response(undefined, {
    status: 200,
    statusText: 'OK',
  });
}
