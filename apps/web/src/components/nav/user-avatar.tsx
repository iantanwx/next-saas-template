import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarProps,
} from '@superscale/ui/components/avatar';
import { Icons } from '../icons';

interface Props extends AvatarProps {
  user: {
    name: string | null;
    image: string | null;
  };
}

export function UserAvatar({ user, ...props }: Props) {
  return (
    <Avatar {...props}>
      {user?.image ? <AvatarImage alt="Picture" src={user.image} /> : null}
      <AvatarFallback>
        <span className="sr-only">{user?.name}</span>
        <Icons.user className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
}
