import { Badge, type badgeVariants } from '@superscale/ui/components/badge';
import { Separator } from '@superscale/ui/components/separator';
import type { VariantProps } from 'class-variance-authority';
import cn from 'classnames';
import { Icons } from '@/components/util/icons';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  badge: {
    copy: string;
    variant?: VariantProps<typeof badgeVariants>['variant'];
  };
  separator?: {
    className?: string;
  };
  price: string;
  description: string;
  items: string[];
  unit?: string;
}

export default function Pricing({
  children,
  unit,
  className,
  badge,
  price,
  description,
  items,
  separator = { className: '' },
  ...props
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-md border border-black p-8',
        className
      )}
      {...props}
    >
      <div className="flex flex-col">
        <div>
          <Badge className="mb-4" variant={badge.variant}>
            {badge.copy}
          </Badge>
        </div>
        <h2 className="mb-2 text-3xl font-bold">
          {price}
          <span className="text-sm font-normal">{unit}</span>
        </h2>
        <p className="text-lg">{description}</p>
        <Separator className={cn('my-8', separator.className)} />
        <ul className="mb-8 space-y-4">
          {items.map((item) => (
            <li key={item} className="flex flex-row items-center justify-start">
              <Icons.checkCircle className="mr-2" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
