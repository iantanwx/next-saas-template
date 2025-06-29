import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@superscale/ui/components/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@superscale/ui/components/form';
import { Input } from '@superscale/ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserWithMemberships } from '@superscale/crud/types';
import { t } from '@superscale/trpc/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';
import { z } from 'zod';

interface Props {
  user: UserWithMemberships;
  setLoading: (loading: boolean) => void;
}

export default function OrganizationStep({ user, setLoading }: Props) {
  const currentValue = user.memberships[0]?.organization.name ?? '';
  const { client } = t.useUtils();
  const { activeStep } = useWizard();
  const formSchema = z.object({
    organization: z
      .string()
      .min(1, 'Organization name is required.')
      .refine(
        async (name) => {
          if (name === currentValue) {
            return true;
          }
          const exists = await client.organization.exists.query({
            nameOrSlug: name,
          });
          return !exists;
        },
        { message: 'Organization name is already taken.' }
      ),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: currentValue,
    },
  });

  const createOrganization = t.organization.create.useMutation();
  const router = useRouter();
  const submit = form.handleSubmit(
    async ({ organization }: z.infer<typeof formSchema>) => {
      try {
        setLoading(true);
        const org = await createOrganization.mutateAsync({
          userId: user.id,
          organizationName: organization,
          completedOnboarding: true,
        });
        router.push(`/${org.slug}`);
        return;
      } finally {
        setLoading(false);
      }
    }
  );

  return (
    <>
      <CardHeader>
        <CardTitle>What's the name of your company or team?</CardTitle>
        <CardDescription>
          This will be the name of your workspace -- use something that your
          team will recognize.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id={`onboarding-step-${activeStep + 1}`} onSubmit={submit}>
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="text" placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </>
  );
}
