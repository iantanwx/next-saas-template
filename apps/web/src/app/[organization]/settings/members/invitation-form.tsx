'use client';

import { Icons } from '@/components/icons';
import { Button } from '@superscale/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@superscale/ui/components/form';
import { Input } from '@superscale/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@superscale/ui/components/select';
import { useToast } from '@superscale/ui/components/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Organization,
  OrganizationRole,
  UserWithMemberships,
} from '@superscale/crud/types';
import { t } from '@superscale/trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
});

interface Props {
  user: UserWithMemberships;
  organization: Organization;
}

type Roles = Exclude<OrganizationRole, 'owner'>;

export function InvitationForm({ organization }: Props) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'member' as Roles,
    },
  });
  const [loading, setLoading] = useState(false);
  const invite = t.organization.invite.useMutation();
  const { toast } = useToast();
  const submit = form.handleSubmit(async ({ email, role }) => {
    try {
      setLoading(true);
      await invite.mutateAsync({
        email,
        role,
        organizationId: organization.id,
      });
      router.refresh();
      form.reset();
      toast({
        title: 'Invitation sent!',
        description: `An invitation should have been sent to ${email}.`,
      });
    } catch (err) {
      console.error('Error inviting user: ', err);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mb-10 space-y-4">
      <div className="mt-4">
        <h3 className="text-lg font-medium">Invite a team member</h3>
        <p className="text-muted-foreground text-sm">
          Send an invitation to a team member
        </p>
      </div>
      <Form {...form}>
        <form className="flex flex-row items-end space-x-4" onSubmit={submit}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage className="sm:absolute" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={'admin'}>Admin</SelectItem>
                    <SelectItem value={'member'}>Member</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <Button className="mb-[1px]" type="submit">
            Invite
            {loading && <Icons.loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </form>
      </Form>
    </div>
  );
}
