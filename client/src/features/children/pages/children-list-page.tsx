import { useState } from 'react';
import { Link } from 'react-router';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { Plus, Search } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChildren } from '@/features/children/hooks/use-children';
import type { Child, ChildStatus } from '@/types/child';

const columnHelper = createColumnHelper<Child>();

const statusVariant: Record<ChildStatus, 'default' | 'secondary' | 'outline'> = {
  ACTIVE: 'default',
  LEFT: 'secondary',
  WAITLIST: 'outline',
};

const statusLabel: Record<ChildStatus, string> = {
  ACTIVE: 'Active',
  LEFT: 'Left',
  WAITLIST: 'Waitlist',
};

const columns = [
  columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
    id: 'name',
    header: 'Name',
    cell: (info) => (
      <Link
        to={`/children/${info.row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('dateOfBirth', {
    header: 'Date of Birth',
    cell: (info) => format(parseISO(info.getValue()), 'dd MMM yyyy'),
  }),
  columnHelper.accessor('room', {
    header: 'Room',
    cell: (info) => info.getValue()?.name ?? '—',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const status = info.getValue();
      return (
        <Badge variant={statusVariant[status]}>
          {statusLabel[status]}
        </Badge>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => (
      <Link to={`/children/${info.row.original.id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    ),
  }),
];

export function ChildrenListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const params = {
    ...(search ? { search } : {}),
    ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
  };

  const { data: children, isLoading } = useChildren(params);

  const table = useReactTable({
    data: children ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <PageHeader
        title="Children"
        description="Manage children enrolled at your nursery"
        action={
          <Link to="/children/new">
            <Button>
              <Plus className="size-4" />
              Add Child
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="LEFT">Left</SelectItem>
            <SelectItem value="WAITLIST">Waitlist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : children?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-lg font-medium">No children found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first child.
          </p>
          <Link to="/children/new" className="mt-4">
            <Button>
              <Plus className="size-4" />
              Add Child
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
