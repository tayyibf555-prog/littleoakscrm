import api from './client';

export interface DashboardOverview {
  stats: {
    activeChildren: number;
    activeStaff: number;
    childrenPresentToday: number;
    staffPresentToday: number;
    openIncidents: number;
  };
  rooms: Array<{
    id: string;
    name: string;
    capacity: number;
    childCount: number;
    staffCount: number;
    ratioRequired: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    startDate: string;
    eventType: string;
  }>;
  recentIncidents: Array<{
    id: string;
    date: string;
    severity: string;
    status: string;
    children: Array<{ child: { firstName: string; lastName: string } }>;
  }>;
  overdueInvoices: Array<{
    id: string;
    invoiceNumber: string;
    total: number;
    dueDate: string;
    parent: { firstName: string; lastName: string };
  }>;
  expiringDbs: Array<{
    id: string;
    expiryDate: string;
    staff: { firstName: string; lastName: string };
  }>;
}

export const dashboardApi = {
  getOverview: () => api.get<DashboardOverview>('/dashboard/overview'),
};
