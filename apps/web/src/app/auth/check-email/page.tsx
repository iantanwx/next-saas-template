import * as z from 'zod';
import Image from 'next/image';

const schema = z.object({
  email: z.string().email(),
});

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function CheckEmailPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = schema.safeParse(searchParams);
  return (
    <div className="container h-full">
      <div className="flex h-full w-full flex-col items-center justify-center sm:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center">
          {params.success ? (
            <div className="flex flex-col justify-center">
              <h1 className="pb-8 text-4xl font-bold">
                Please check your email.
              </h1>
              <p className="pb-6 font-bold">Almost there!</p>
              <p className="pb-4 text-muted-foreground">
                We've sent an email to {params.data.email}. Please check your
                email and click the link in the email to confirm your account.
              </p>
              <p className="text-muted-foreground">
                You'll be redirected to your workspace.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <h1 className="pb-8 text-4xl font-bold">
                Were you trying to sign in?
              </h1>
              <p className="text-center text-muted-foreground">
                We weren't able to find the email you entered. Please try again.
              </p>
            </div>
          )}
        </div>
        <div className="hidden flex-1 flex-col md:flex">
          <Image src="/logo.png" alt={'logo'} width="800" height="800" />
        </div>
      </div>
    </div>
  );
}
