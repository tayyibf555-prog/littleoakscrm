import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getOverview().then((res) => res.data),
    refetchInterval: 60_000,
  });
}
