import { UserWithMemberships, Organization } from '@superscale/crud/types';
import { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    user: UserWithMemberships;
    organization: Organization;
  }
}
