// src/lib/hooks/reports.ts
import { useQuery } from '@tanstack/react-query';
import client from '@/lib/client';
import type { ReportsDashboard, ReportsParams } from '@/lib/types';
import { qkey } from '@/lib/utils';

export function useReportsDashboard(params?: ReportsParams) {
  type T = ReportsDashboard;
  return useQuery<T>({
    queryKey: qkey('reports-dashboard', params),
    queryFn: () => client.getDashboardReports(params || {}),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}
