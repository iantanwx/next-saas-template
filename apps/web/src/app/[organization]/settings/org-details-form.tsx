'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  OrganizationWithMembers,
  UserWithMemberships,
} from '@superscale/crud/types';
import { TRPCClientError, t } from '@superscale/trpc/client';
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
import { useToast } from '@superscale/ui/components/use-toast';
import cn from 'classnames';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Icons } from '@/components/icons';

interface Props {
  user: UserWithMemberships;
  organization: OrganizationWithMembers;
}

export function OrganizationSettingsForm({ user, organization }: Props) {
  const { client } = t.useUtils();
  const checkExists = async (value: string) => {
    const exists = await client.organization.exists.query({
      nameOrSlug: value,
    });
    return !exists;
  };

  const formSchema = z.object({
    name: z.string().min(1).max(50).refine(checkExists),
    slug: z.string().min(1).max(50).refine(checkExists),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const update = t.organization.update.useMutation();
  const { toast } = useToast();
  const submit = form.handleSubmit(async ({ name, slug }) => {
    try {
      setLoading(true);
      await update.mutateAsync({
        organizationId: organization.id,
        name,
        slug,
      });
      toast({ title: 'Organization updated' });
      router.replace(`/${slug}/settings`);
    } catch (error) {
      const message =
        error instanceof TRPCClientError ? error.message : undefined;
      toast({
        title: 'Something went wrong',
        variant: 'destructive',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  });
  const isOwner =
    user.memberships.find((m) => m.organization.id === organization.id)
      ?.role === 'owner';
  const prefixRef = useRef<HTMLDivElement>(null);
  const [spanWidth, setSpanWidth] = useState(0);
  useEffect(() => {
    if (prefixRef.current) {
      setSpanWidth(prefixRef.current.offsetWidth);
    }
  }, []);

  return (
    <div
      className={cn('flex flex-col space-y-4', spanWidth === 0 && 'opacity-0')}
    >
      <h3 className="text-lg font-medium">General</h3>
      <Form {...form}>
        <form className="space-y-4" onSubmit={submit}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:w-auto">
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={!isOwner}
                    className="w-72"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Organization URL</FormLabel>
                <FormControl>
                  <div className="relative w-72">
                    <div className="absolute left-3 flex h-full items-center">
                      <span
                        className="text-muted-foreground text-sm"
                        ref={prefixRef}
                      >
                        superscale.app/
                      </span>
                    </div>
                    <Input
                      disabled={!isOwner}
                      className="py-[9px]"
                      style={{ paddingLeft: `calc(${spanWidth}px + 0.75rem)` }}
                      type="text"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="mb-[1px]" type="submit">
            Save
            {loading && <Icons.loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </form>
      </Form>
    </div>
  );
}
