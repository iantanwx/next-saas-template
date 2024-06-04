// import { User } from 'next-auth';
import { AvatarProps } from '@radix-ui/react-avatar';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Icons } from '../icons';

interface Props extends AvatarProps {
  user: any;
}

export function UserAvatar({ user, ...props }: Props) {
  return (
    <Avatar {...props}>
      {user.image ? (
        <AvatarImage alt="Picture" src={user.image} />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name}</span>
          <Icons.user className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
