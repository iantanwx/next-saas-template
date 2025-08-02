import { UserWithMemberships, Organization } from '@superscale/crud/types';
import { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    user: UserWithMemberships;
    organization: Organization;
  }
}
