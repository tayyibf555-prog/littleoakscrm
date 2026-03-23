import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from './protected-route';
import { LoginPage } from '@/features/auth/pages/login-page';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { ChildrenListPage } from '@/features/children/pages/children-list-page';
import { ChildCreatePage } from '@/features/children/pages/child-create-page';
import { ChildDetailPage } from '@/features/children/pages/child-detail-page';
import { RoomsPage } from '@/features/rooms/pages/rooms-page';
import { StaffListPage } from '@/features/staff/pages/staff-list-page';
import { StaffCreatePage } from '@/features/staff/pages/staff-create-page';
import { StaffDetailPage } from '@/features/staff/pages/staff-detail-page';
import { AttendancePage } from '@/features/attendance/pages/attendance-page';
import { DiaryPage } from '@/features/diary/pages/diary-page';
import { EyfsPage } from '@/features/eyfs/pages/eyfs-page';
import { IncidentsPage } from '@/features/incidents/pages/incidents-page';
import { IncidentDetailPage } from '@/features/incidents/pages/incident-detail-page';
import { CalendarPage } from '@/features/calendar/pages/calendar-page';
import { AnnouncementsPage } from '@/features/communications/pages/announcements-page';
import { TasksPage } from '@/features/communications/pages/tasks-page';
import { InvoicesPage } from '@/features/invoicing/pages/invoices-page';
import { InvoiceDetailPage } from '@/features/invoicing/pages/invoice-detail-page';
import { InvoiceCreatePage } from '@/features/invoicing/pages/invoice-create-page';
import { SocialMediaPage } from '@/features/social-media/pages/social-media-page';
import { DocumentsPage } from '@/features/documents/pages/documents-page';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Children */}
          <Route path="/children" element={<ChildrenListPage />} />
          <Route path="/children/new" element={<ChildCreatePage />} />
          <Route path="/children/:id" element={<ChildDetailPage />} />

          {/* Rooms */}
          <Route path="/rooms" element={<RoomsPage />} />

          {/* Staff */}
          <Route path="/staff" element={<StaffListPage />} />
          <Route path="/staff/new" element={<StaffCreatePage />} />
          <Route path="/staff/:id" element={<StaffDetailPage />} />

          {/* Attendance */}
          <Route path="/attendance" element={<AttendancePage />} />

          {/* Daily Diary */}
          <Route path="/diary" element={<DiaryPage />} />

          {/* EYFS */}
          <Route path="/eyfs" element={<EyfsPage />} />

          {/* Incidents */}
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />

          {/* Calendar */}
          <Route path="/calendar" element={<CalendarPage />} />

          {/* Communications */}
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/tasks" element={<TasksPage />} />

          {/* Invoicing */}
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<InvoiceCreatePage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

          {/* Social Media */}
          <Route path="/social-media" element={<SocialMediaPage />} />

          {/* Documents */}
          <Route path="/documents" element={<DocumentsPage />} />

          {/* Settings - placeholder for now */}
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">This section will be built in a future phase.</p>
    </div>
  );
}
