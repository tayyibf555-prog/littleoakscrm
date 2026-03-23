import { useLocation, Link } from 'react-router';
import {
  LayoutDashboard,
  Baby,
  Users,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  Calendar,
  Megaphone,
  ListTodo,
  Share2,
  Receipt,
  FileText,
  Settings,
  DoorOpen,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/providers/auth-provider';

const navigation = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Children', url: '/children', icon: Baby },
  { title: 'Staff', url: '/staff', icon: Users },
  { title: 'Attendance', url: '/attendance', icon: ClipboardCheck },
  { title: 'Rooms', url: '/rooms', icon: DoorOpen },
  { title: 'Daily Diary', url: '/diary', icon: BookOpen },
  { title: 'EYFS', url: '/eyfs', icon: GraduationCap },
  { title: 'Incidents', url: '/incidents', icon: AlertTriangle },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
  { title: 'Announcements', url: '/announcements', icon: Megaphone },
  { title: 'Tasks', url: '/tasks', icon: ListTodo },
  { title: 'Social Media', url: '/social-media', icon: Share2 },
  { title: 'Invoicing', url: '/invoices', icon: Receipt },
  { title: 'Documents', url: '/documents', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Little Oaks</span>
        </Link>
        {user?.staffProfile && (
          <p className="mt-1 text-xs text-muted-foreground">
            {user.staffProfile.firstName} {user.staffProfile.lastName}
          </p>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {user?.role === 'ADMIN' ? 'Administrator' : user?.role}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
