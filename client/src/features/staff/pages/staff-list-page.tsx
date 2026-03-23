import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { Plus, Search, Shield } from 'lucide-react';

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
import { useStaff } from '@/features/staff/hooks/use-staff';
import type { Staff } from '@/types/staff';

const columnHelper = createColumnHelper<Staff>();

const columns = [
  columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
    id: 'name',
    header: 'Name',
    cell: (info) => (
      <Link
        to={`/staff/${info.row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('jobTitle', {
    header: 'Job Title',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('department', {
    header: 'Department',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('startDate', {
    header: 'Start Date',
    cell: (info) => format(parseISO(info.getValue()), 'dd MMM yyyy'),
  }),
  columnHelper.accessor('isActive', {
    header: 'Status',
    cell: (info) => (
      <Badge variant={info.getValue() ? 'default' : 'secondary'}>
        {info.getValue() ? 'Active' : 'Inactive'}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => (
      <Link to={`/staff/${info.row.original.id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    ),
  }),
];

export function StaffListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: staff, isLoading } = useStaff();

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    let result = staff;

    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'ACTIVE';
      result = result.filter((s) => s.isActive === isActive);
    }

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.firstName.toLowerCase().includes(lower) ||
          s.lastName.toLowerCase().includes(lower) ||
          s.jobTitle.toLowerCase().includes(lower) ||
          (s.email && s.email.toLowerCase().includes(lower)),
      );
    }

    return result;
  }, [staff, statusFilter, search]);

  const table = useReactTable({
    data: filteredStaff,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage staff members at your nursery"
        action={
          <Link to="/staff/new">
            <Button>
              <Plus className="size-4" />
              Add Staff
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, title, or email..."
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
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-lg font-medium">No staff members found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first staff member.
          </p>
          <Link to="/staff/new" className="mt-4">
            <Button>
              <Plus className="size-4" />
              Add Staff
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
