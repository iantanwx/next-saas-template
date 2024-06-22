/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useToast } from '~/components/ui/use-toast';
import { canRemove, getRole } from '@superscale/lib/auth/utils';
import { OrganizationRole } from '@superscale/crud/types';
import { t } from '@superscale/trpc/client';
import { createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BaseRowData {
  email: string;
  role: OrganizationRole;
}

interface MemberRowData extends BaseRowData {
  type: 'member';
  userId: string;
  name: string;
  imageUrl: string | null;
}

interface InvitationRowData extends BaseRowData {
  type: 'invitation';
  invitationId: string;
}

export type RowData = MemberRowData | InvitationRowData;

const columnHelper = createColumnHelper<RowData>();

const roleMap: Record<OrganizationRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

export const columns = [
  columnHelper.display({
    id: 'image',
    size: 50,
    cell({ row: { original: data } }) {
      const imageUrl = data.type === 'member' ? data.imageUrl : undefined;
      const name = data.type === 'member' ? data.name : data.email;
      const initials = name
        .split(' ')
        .map((n) => n[0].toUpperCase())
        .join('')
        .slice(0, 2);
      return (
        <Avatar>
          <AvatarImage src={imageUrl ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      );
    },
  }),
  columnHelper.accessor(
    (row) => ({
      email: row.email,
      name: row.type === 'member' ? row.name : null,
      isInvitation: row.type === 'invitation',
    }),
    {
      id: 'name_email',
      cell(props) {
        const v = props.cell.getValue();
        return (
          <div className="flex flex-col">
            {v.name ? <p>{v.name}</p> : null}
            <p className="text-muted-foreground">{v.email}</p>
          </div>
        );
      },
      filterFn(row, columnId, value) {
        const v = row.getValue(columnId) as { email: string; name?: string };
        return (
          v.email.toLowerCase().includes(value) ||
          !!v.name?.toLowerCase().includes(value)
        );
      },
    }
  ),
  columnHelper.accessor((row) => row.role, {
    id: 'role',
    size: 100,
    cell(props) {
      const router = useRouter();
      const { toast } = useToast();
      const updateRole = t.organization.updateMemberRole.useMutation();
      const { user: currentUser, organization } = props.table.options.meta!;
      const organizationRole = currentUser.memberships.find(
        (m) => m.organization.id === organization.id
      )?.role;
      const handleChange = async (value: OrganizationRole) => {
        if (
          value === props.row.original.role ||
          value === 'owner' ||
          props.row.original.type === 'invitation'
        )
          return;
        try {
          await updateRole.mutateAsync({
            organizationId: props.table.options.meta!.organization.id,
            userId: props.row.original.userId,
            role: value,
          });
          router.refresh();
        } catch (err) {
          toast({
            title: 'Error updating role',
            description: (err as Error).message,
            variant: 'destructive',
          });
        }
      };
      return (
        <div className="flex flex-row items-center space-x-4">
          {props.row.original.type === 'member' ? (
            <Select
              onValueChange={handleChange}
              defaultValue={props.row.original.role}
              value={props.row.original.role}
              disabled={
                props.row.original.role === 'owner' ||
                organizationRole === 'member'
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a role." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  disabled={organizationRole !== 'owner'}
                  value="owner"
                >
                  {roleMap['owner']}
                </SelectItem>
                <SelectItem value="admin">{roleMap['admin']}</SelectItem>
                <SelectItem value="member">{roleMap['member']}</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
          {props.row.original.type === 'invitation' ? (
            <div className="inline-flex flex-row justify-center space-x-2">
              <span className="border-muted-foreground text-muted-foreground inline-block rounded border-[1px] px-2 py-0.5 text-xs">
                Pending
              </span>
              <span className="text-sm">
                {roleMap[props.row.original.role]}
              </span>
            </div>
          ) : null}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    size: 50,
    cell(props) {
      const row = props.row;
      const { user: currentUser, organization } = props.table.options.meta!;
      const organizationRole = getRole(currentUser, organization.id)!;
      const removeMember = t.organization.removeMember.useMutation();
      const leaveOrganization = t.organization.leaveOrganization.useMutation();
      const revokeInvitation = t.organization.revokeInvitation.useMutation();
      const resendInvitation = t.organization.resendInvitation.useMutation();
      const router = useRouter();
      const { toast } = useToast();
      const handleRemove = async () => {
        const { userId } = row.original as MemberRowData;
        await removeMember.mutateAsync({
          organizationId: organization.id,
          userId,
        });
        toast({ title: 'Member removed' });
        router.refresh();
      };
      const handleLeave = async () => {
        await leaveOrganization.mutateAsync({
          organizationId: organization.id,
        });
        router.replace('/');
      };
      const handleRevoke = async () => {
        const { invitationId } = row.original as InvitationRowData;
        await revokeInvitation.mutateAsync({
          organizationId: organization.id,
          invitationId,
        });
        toast({ title: 'Invitation revoked' });
        router.refresh();
      };
      const handleResend = async () => {
        const { invitationId } = row.original as InvitationRowData;
        await resendInvitation.mutateAsync({
          organizationId: organization.id,
          invitationId,
        });
        toast({ title: 'Invitation resent' });
        router.refresh();
      };
      return (
        <div className="flex w-full flex-row justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {row.original.type === 'member' &&
              currentUser.id !== row.original.userId ? (
                <DropdownMenuItem
                  onClick={handleRemove}
                  disabled={!canRemove(organizationRole, row.original.role)}
                >
                  Remove
                </DropdownMenuItem>
              ) : null}
              {row.original.type === 'member' &&
              currentUser.id === row.original.userId ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLeave}
                  disabled={row.original.role === 'owner'}
                >
                  Leave
                </DropdownMenuItem>
              ) : null}
              {row.original.type === 'invitation' ? (
                <DropdownMenuItem onClick={handleRevoke}>
                  Revoke
                </DropdownMenuItem>
              ) : null}
              {row.original.type === 'invitation' ? (
                <DropdownMenuItem onClick={handleResend}>
                  Resend
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  }),
];
