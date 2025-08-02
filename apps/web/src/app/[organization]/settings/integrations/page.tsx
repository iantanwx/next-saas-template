import { Slack } from 'lucide-react';
import { Integration } from '@/components/integration';

const integrations = [
  {
    name: 'Slack',
    description: 'Connect your Slack workspace to your workspace.',
    icon: Slack,
    redirectUrl: '/settings/integrations/slack',
  },
];

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold">Integrations</h1>
      <p className="text-muted-foreground mb-8">
        Connect your workspace with these powerful integrations to enhance your
        workflow.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Integration key={integration.name} {...integration} />
        ))}
      </div>
    </div>
  );
}
