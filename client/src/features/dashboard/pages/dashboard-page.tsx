import { Link } from 'react-router';
import { format, parseISO, isBefore } from 'date-fns';
import {
  Baby,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  FileText,
  Shield,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function getRatioStatus(childCount: number, staffCount: number, ratioRequired: string) {
  const parts = ratioRequired.split(':');
  const staffNeeded = Math.ceil(childCount / Number(parts[1]));
  if (staffCount >= staffNeeded) return 'good';
  if (staffCount >= staffNeeded - 1) return 'warning';
  return 'danger';
}

export function DashboardPage() {
  const { data, isLoading } = useDashboard();

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your nursery" />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Children"
          value={data?.stats.activeChildren ?? 0}
          subtitle="Active enrolments"
          icon={Baby}
          loading={isLoading}
        />
        <StatCard
          title="Staff on Duty"
          value={data?.stats.staffPresentToday ?? 0}
          subtitle={`${data?.stats.activeStaff ?? 0} total staff`}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="Attendance Today"
          value={data?.stats.childrenPresentToday ?? 0}
          subtitle="Children present"
          icon={ClipboardCheck}
          loading={isLoading}
        />
        <StatCard
          title="Open Incidents"
          value={data?.stats.openIncidents ?? 0}
          subtitle="Pending sign-off"
          icon={AlertTriangle}
          loading={isLoading}
        />
      </div>

      {/* Room Ratios */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Room Ratios</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {data?.rooms.map((room) => {
              const status = getRatioStatus(room.childCount, room.staffCount, room.ratioRequired);
              return (
                <Card key={room.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{room.name}</CardTitle>
                      <Badge
                        variant={
                          status === 'good'
                            ? 'default'
                            : status === 'warning'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {room.ratioRequired}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span>
                        Children: <strong>{room.childCount}</strong>/{room.capacity}
                      </span>
                      <span>
                        Staff: <strong>{room.staffCount}</strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Upcoming Events</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </div>
            <Link to="/calendar">
              <Button variant="ghost" size="sm">
                <Calendar className="mr-1 size-4" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : data?.upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {data?.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{event.eventType.replace('_', ' ')}</Badge>
                      <span>{event.title}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {format(parseISO(event.startDate), 'dd MMM')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Incidents</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </div>
            <Link to="/incidents">
              <Button variant="ghost" size="sm">
                <AlertTriangle className="mr-1 size-4" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : data?.recentIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent incidents</p>
            ) : (
              <div className="space-y-3">
                {data?.recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          incident.severity === 'SERIOUS'
                            ? 'destructive'
                            : incident.severity === 'MODERATE'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {incident.severity}
                      </Badge>
                      <span>
                        {incident.children
                          ?.map((c) => `${c.child.firstName} ${c.child.lastName}`)
                          .join(', ')}
                      </span>
                    </div>
                    <Badge variant={incident.status === 'OPEN' ? 'destructive' : 'default'}>
                      {incident.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Overdue Invoices</CardTitle>
              <CardDescription>Payment outstanding</CardDescription>
            </div>
            <Link to="/invoices">
              <Button variant="ghost" size="sm">
                <FileText className="mr-1 size-4" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : data?.overdueInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue invoices</p>
            ) : (
              <div className="space-y-3">
                {data?.overdueInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{inv.invoiceNumber}</span>
                      <span className="ml-2 text-muted-foreground">
                        {inv.parent.firstName} {inv.parent.lastName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">£{(inv.total / 100).toFixed(2)}</span>
                      <span className="ml-2 text-xs text-destructive">
                        Due {format(parseISO(inv.dueDate), 'dd MMM')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* DBS Expiry Warnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">DBS Expiry Alerts</CardTitle>
              <CardDescription>Expiring within 30 days</CardDescription>
            </div>
            <Link to="/staff">
              <Button variant="ghost" size="sm">
                <Shield className="mr-1 size-4" />
                View Staff
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : data?.expiringDbs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No DBS checks expiring soon</p>
            ) : (
              <div className="space-y-3">
                {data?.expiringDbs.map((dbs) => {
                  const isExpired = isBefore(parseISO(dbs.expiryDate), new Date());
                  return (
                    <div key={dbs.id} className="flex items-center justify-between text-sm">
                      <span>
                        {dbs.staff.firstName} {dbs.staff.lastName}
                      </span>
                      <Badge variant={isExpired ? 'destructive' : 'secondary'}>
                        {isExpired
                          ? 'EXPIRED'
                          : `Expires ${format(parseISO(dbs.expiryDate), 'dd MMM')}`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
