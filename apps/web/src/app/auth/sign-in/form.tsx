'use client';

import { Button } from '@superscale/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@superscale/ui/components/form';
import { Input } from '@superscale/ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signInWithEmail } from './action';

const formSchema = z.object({
  email: z.string().email(),
});

interface Props {
  email?: string;
  invitationId?: string;
}

export default function SignInForm({ email = '', invitationId }: Props) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email },
  });
  const handleSubmit = async ({ email }: z.infer<typeof formSchema>) => {
    try {
      await signInWithEmail(email, invitationId);
      router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error('Error sending email: ', err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="you@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="mt-4 w-full"
          variant="outline"
          disabled={!form.formState.isValid}
        >
          Continue
        </Button>
      </form>
    </Form>
  );
}
