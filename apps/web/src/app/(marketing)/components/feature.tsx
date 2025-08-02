import cn from 'classnames';
import { Icons, type KnownIcon } from '@/components/util/icons';

type Props = {
  className?: string;
  icon: KnownIcon;
  header: string;
  description: string;
};

export default function Feature({
  className,
  icon,
  header,
  description,
}: Props) {
  const Icon = Icons[icon];
  return (
    <div
      className={cn(
        'flex flex-col rounded-md border border-black p-10',
        className
      )}
    >
      <div className="mb-6 flex items-center justify-start">
        <span className="rounded-full border border-black bg-white p-3">
          <Icon />
        </span>
      </div>
      <h3 className="mb-2 text-2xl font-bold">{header}</h3>
      <p>{description}</p>
    </div>
  );
}
