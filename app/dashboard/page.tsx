// pages/dashboard.tsx

"use client";

import MainAppLayout from '@/components/MainAppLayout';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useReportsDashboard } from '@/hooks/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Users, DollarSign, AlertCircle } from 'lucide-react';
import { ReportsDashboard } from '@/lib/types';

const defaultDashboardData: ReportsDashboard = {
  financials: {
    revenue: 0,
    expenses: 0,
    profit: 0,
    dues: 0,
    status: 'N/A',
  },
  totalStudents: 0,
  reports: [],
};

const DashboardPage = () => {
  const { data, isLoading, error } = useReportsDashboard();

  useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard data", {
        description: "Showing preview with empty data.",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dashboardData = data || defaultDashboardData;

  const { financials, totalStudents, reports } = dashboardData;

  return (
    <div className="space-y-8 p-6 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your tuition center's performance.</p>
      </div>

      {/* Financials Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{financials.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total collected fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{financials.expenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total operational costs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className={financials.status === 'Profit' ? "h-4 w-4 text-green-500" : "h-4 w-4 text-red-500"} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financials.status === 'Profit' ? 'text-green-600' : 'text-red-600'}`}>
              ₹{financials.profit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {financials.status}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{financials.dues.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Total Students Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground">Currently enrolled</p>
        </CardContent>
      </Card>

      {/* Student Reports Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Student Performance Reports</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Academic Score</TableHead>
                <TableHead>Tests Taken</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{report.name}</div>
                      {report.parentsName && (
                        <div className="text-xs text-muted-foreground">
                          Parent: {report.parentsName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.phone ? (
                      <div className="text-sm">{report.phone}</div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {report.metrics.academicPercentage === 'N/A' ? (
                      <span className="text-muted-foreground">N/A</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${typeof report.metrics.academicPercentage === 'number'
                            ? report.metrics.academicPercentage >= 90
                              ? 'text-green-600'
                              : report.metrics.academicPercentage >= 60
                                ? 'text-blue-600'
                                : report.metrics.academicPercentage >= 40
                                  ? 'text-orange-600'
                                  : 'text-red-600'
                            : ''
                          }`}>
                          {report.metrics.academicPercentage}%
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.metrics.testsTaken}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="line-clamp-2" title={report.review}>
                      {report.review || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {report.tags && report.tags.length > 0 ? (
                        report.tags.map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No reports available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <DashboardPage />
  );
};

export default Dashboard;