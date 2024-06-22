import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Icons } from '~/components/util/icons';
import Link from 'next/link';
import Feature from './components/feature';
import Pricing from './components/pricing';

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-24 px-12 py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 text-center">
        <div>
          <Badge variant="outline">100% Open Source</Badge>
        </div>
        <h1 className="text-6xl font-bold">The Frontend Cloud you own.</h1>
        <p className="text-xl">
          Superscale is a Frontend PaaS that deploys full stack JavaScript
          applications into your own cloud account, 100% open source and
          self-hostable.
        </p>
        <div className="flex flex-row items-center justify-center gap-4">
          <Button asChild>
            <Link href="#waitlist">
              Join the Waitlist
              <Icons.arrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link
              href="https://github.com/superscalehq/superscale"
              target="_blank"
              rel="noreferrer"
            >
              <Icons.github className="mr-2 h-4 w-4" />
              Star on GitHub
            </Link>
          </Button>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-12 gap-4">
        <div className="col-span-12 mb-6 text-center">
          <h1 className="mb-6 text-4xl font-bold">
            Best-in-class DX, 100% control
          </h1>
          <p className="text-lg">
            Superscale delivers the developer experience of a best-in-class
            Frontend Cloud while deploying into your infrastructure. No lock in,
            opaque pricing, hidden costs, or surprise bills.
          </p>
        </div>
        <Feature
          className="bg-slimegreen-01 col-span-12 md:col-span-4"
          icon="cloud"
          header="BYO Cloud"
          description="Since we deploy into your infrastructure, you can easily integrate existing systems with Superscale-managed frontends."
        />
        <Feature
          className="col-span-12 bg-gray-200 md:col-span-4"
          icon="server"
          header="Self-host"
          description="Does your organization have exceptional needs? Superscale is 100% open source and self-hostable."
        />
        <Feature
          className="bg-primary-01 col-span-12 md:col-span-4"
          icon="nextjs"
          header="Next.js support"
          description="Superscale has first-class support for Next.js, including state-of-the-art features like caching and ISR."
        />
        <Feature
          className="col-span-12 bg-gray-200 md:col-span-4"
          icon="refresh"
          header="Push-to-deploy"
          description="Superscale automatically builds and deploys your changes, saving your from fighting brittle CI/CD pipelines."
        />
        <Feature
          className="bg-topaz-01 col-span-12 md:col-span-4"
          icon="dollar"
          header="Cost control"
          description="Advanced cost controls allow you to set budgets and alerts for the underlying infrastructure in a simple way. No surprise bills."
        />
        <Feature
          className="col-span-12 bg-gray-200 md:col-span-4"
          icon="rollback"
          header="Instant Rollback"
          description="Deploy on Friday with full confidence with one-click rollbacks."
        />
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-12 gap-4">
        <div className="col-span-12 mb-6 text-center">
          <h1 className="mb-6 text-4xl font-bold">Transparent pricing</h1>
          <p className="text-lg">
            Our mission is to provide a best-in-class platform for frontend
            developers at a fair price. Superscale is free to self-host, with a
            cloud offering that has no hidden costs.
          </p>
        </div>
        <div className="col-span-12 grid grid-cols-12 gap-4">
          <Pricing
            className="col-span-4 bg-white"
            badge={{ copy: 'Free', variant: 'secondary' }}
            price="$0"
            unit=" / month"
            description="All the benefits of Superscale, for free."
            items={[
              'Full Next.js support',
              'Unlimited deployments',
              'Two preview environments',
              'One team member',
              'Community support',
            ]}
          >
            <Button variant="secondary" asChild>
              <Link href="#waitlist">
                Join the Waitlist
                <Icons.arrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Pricing>
          <Pricing
            className="col-span-4 border-black bg-black text-white"
            badge={{ copy: 'Pro', variant: 'default' }}
            price="$15"
            unit=" / user / month"
            description="For teams and projects with rapid iteration cycles."
            items={[
              'Full Next.js support',
              'Unlimited deployments',
              'Unlimited preview environments',
              'Custom domains',
              'Advanced cost controls',
              'Email support',
            ]}
            separator={{ className: 'bg-white' }}
          >
            <Button
              variant="default"
              className="hover:shadow-background-md"
              asChild
            >
              <Link href="#waitlist">
                Join the Waitlist
                <Icons.arrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Pricing>
          <Pricing
            className="col-span-4 bg-white"
            badge={{ copy: 'Enterprise', variant: 'secondary' }}
            price="Custom"
            description="For organizations with exceptional needs."
            items={[
              'Full Next.js support',
              'Unlimited deployments',
              'Unlimited preview environments',
              'Advanced cost controls',
              'On-premises deployment',
              '24/7 support',
              'SLA',
            ]}
          >
            <Button variant="secondary" asChild>
              <Link href="#waitlist">Contact Us</Link>
            </Button>
          </Pricing>
        </div>
      </div>
      <div className="border-1 mx-auto flex w-full max-w-5xl flex-col gap-2 rounded-md border border-black bg-gray-200 p-12">
        <h1 className="col-span-12 mb-6 text-center text-4xl font-semibold">
          Coming Soon 🚀
        </h1>
        <p className="text-md mb-6 text-center">
          Superscale is currently in development. Help us develop the product by
          joining the waitlist and becoming a beta tester, starring the project
          on GitHub, or writing some code!
        </p>
        <div className="col-span-12 flex flex-row items-center justify-center gap-4">
          <Button
            variant="secondary"
            className=" hover:bg-primary-01 bg-black text-white hover:text-black"
            asChild
          >
            <Link href="#waitlist">
              Join the Waitlist
              <Icons.arrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="#waitlist">
              <Icons.github className="mr-2 h-4 w-4" />
              Star on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
