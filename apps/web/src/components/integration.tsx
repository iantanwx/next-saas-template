import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@superscale/ui/atoms/button';
import { Switch } from '@superscale/ui/atoms/switch';
import { type LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface IntegrationProps {
  name: string;
  description: string;
  icon: LucideIcon;
  redirectUrl: string;
}

export function Integration({
  name,
  description,
  icon: Icon,
  redirectUrl,
}: IntegrationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-6 w-6 text-slate-500" />
          {name}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Connect and integrate with {name} to enhance your workflow.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Switch id={`${name.toLowerCase()}-notifications`} checked />
        <Button asChild>
          <Link href={redirectUrl}>Install</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
