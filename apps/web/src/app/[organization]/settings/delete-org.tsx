'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  OrganizationWithMembers,
  UserWithMemberships,
} from '@superscale/crud/types';
import { TRPCClientError, t } from '@superscale/trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Props {
  organization: OrganizationWithMembers;
  user: UserWithMemberships;
}

export function DeleteOrganization({ organization, user }: Props) {
  const isOwner = user.memberships.find(
    (membership) =>
      membership.organizationId === organization.id &&
      membership.role === 'owner'
  );
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(
      z.object({
        organizationName: z.literal(organization.name, {
          errorMap: () => ({ message: 'Organization name does not match' }),
        }),
      })
    ),
    defaultValues: {
      organizationName: '',
    },
  });
  const router = useRouter();
  const { toast } = useToast();
  const deleteOrganization = t.organization.softDelete.useMutation();
  const submit = form.handleSubmit(async () => {
    try {
      await deleteOrganization.mutateAsync({
        organizationId: organization.id,
      });
      router.replace(`/`);
    } catch (error) {
      const message =
        error instanceof TRPCClientError
          ? error.shape.message
          : 'Something went wrong';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  });
  return (
    <div className="flex flex-col items-start space-y-4">
      <h3 className="text-lg font-medium">Delete organization</h3>
      <p className="text-muted-foreground text-sm">
        If you want to delete this organization, including all members and
        invitations, you can do so below.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" disabled={!isOwner}>
            Delete organization
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this organization? This action
              cannot be undone. If you are sure, type the name of the
              organization.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-2 mt-4">
            <p className="text-sm font-medium">
              Organization name:{' '}
              <span className="font-bold text-red-500">
                {organization.name}
              </span>
            </p>
          </div>
          <Form {...form}>
            <form id="delete-org" onSubmit={submit}>
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={organization.name}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button form="delete-org" type="submit" variant="destructive">
              Delete organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
