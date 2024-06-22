import { NotFoundLayout } from '~/components/layout/not-found';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import Link from 'next/link';

export default async function InvitationNotFound() {
  return (
    <NotFoundLayout>
      <Card className="flex flex-col items-center md:w-[450px]">
        <CardHeader>
          <CardTitle>Invitation not found</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 text-center">
          <p className="text-foreground text-sm">
            Please contact the person who invited you to get a new invitation.
          </p>
          <Button variant="ghost" asChild>
            <Link href="/">Back</Link>
          </Button>
        </CardContent>
      </Card>
    </NotFoundLayout>
  );
}
