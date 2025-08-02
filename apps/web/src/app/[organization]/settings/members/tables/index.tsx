'use client';

import type { Organization, UserWithMemberships } from '@superscale/crud/types';
import { Input } from '@superscale/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@superscale/ui/components/table';
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { columns, type RowData } from './columns';

interface Props<TData> {
  // See https://github.com/TanStack/table/issues/4382
  // The type of the columnDef is not inferred correctly.
  data: TData[];
  user: UserWithMemberships;
  organization: Organization;
}

export function MembersTable<TData extends RowData>({
  data,
  user,
  organization,
}: Props<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    meta: { user, organization },
    state: { columnFilters },
  });

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row items-end justify-between">
        <div className="text-sm font-semibold">{data.length} members</div>
        <div className="relative w-full sm:w-[360px]">
          <Input
            className="pr-8"
            placeholder="Search by email or name"
            value={
              (table.getColumn('name_email')?.getFilterValue() as string) ?? ''
            }
            onChange={(e) => {
              table.getColumn('name_email')?.setFilterValue(e.target.value);
            }}
          />
          <SearchIcon
            height={16}
            width={16}
            className="text-muted-foreground absolute right-3 top-2 h-6 text-xs"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`w-[${cell.column.getSize()}px]`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
