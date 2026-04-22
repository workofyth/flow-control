"use client";

import { useState, useEffect } from "react";
import { useDags } from "@/hooks/useDags";
import { DagStatusBadge } from "@/components/dag/DagStatusBadge";
import { TriggerDialog } from "@/components/dag/TriggerDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Search, Filter, RefreshCw, MoreVertical, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [triggerDagId, setTriggerDagId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const { data, isLoading, refetch, isFetching } = useDags({ 
    search: search || undefined,
    limit: search ? -1 : limit, // No limit when searching
    offset: search ? 0 : offset 
  });

  useEffect(() => {
    fetchStats();
  }, [data]);

  const fetchStats = async () => {
    try {
      const resp = await fetch("/api/dashboard/stats");
      const d = await resp.json();
      setStats(d);
    } catch (e) {
      console.error(e);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const filteredDags = data?.dags;
  const totalEntries = data?.total_entries || 0;
  const totalPages = Math.ceil(totalEntries / limit);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DAGs Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your Airflow workflows in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { refetch(); fetchStats(); }} disabled={isFetching || isStatsLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${(isFetching || isStatsLoading) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Success Runs</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {isStatsLoading ? <Skeleton className="h-8 w-16" /> : stats?.successCount || 0}
            </div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Based on recent 500 runs</p>
          </CardContent>
        </Card>
        
        <Card className="bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400">Failed Runs</CardTitle>
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {isStatsLoading ? <Skeleton className="h-8 w-16" /> : stats?.failedCount || 0}
            </div>
            <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">Critical actions required</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Longest Running</CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              {isStatsLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : stats?.longestDags?.length > 0 ? (
                stats.longestDags.slice(0, 3).map((d: any) => (
                  <div key={d.dagId} className="flex items-center justify-between text-amber-900 dark:text-amber-200">
                    <span className="truncate max-w-[120px] font-mono">{d.dagId}</span>
                    <span className="font-bold">{Math.round(d.duration / 60)} min</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50 dark:shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Workflows</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search DAGs..."
                className="pl-8 bg-slate-50 dark:bg-slate-900 border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Showing {filteredDags?.length || 0} of {totalEntries} total DAGs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                  <TableHead className="w-[300px]">DAG ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredDags?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No DAGs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDags?.map((dag) => (
                    <TableRow key={dag.dag_id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <TableCell className="font-medium">
                        <Link href={`/dags/${dag.dag_id}`} className="hover:text-primary transition-colors">
                          {dag.dag_id}
                        </Link>
                        {dag.tags.map((tag) => (
                          <span key={tag.name} className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                            {tag.name}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        <DagStatusBadge status={dag.is_paused ? "paused" : "active"} />
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {dag.scheduler_type || "None"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dag.last_run_execution_date ? new Date(dag.last_run_execution_date).toLocaleString() : "Never"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dag.next_dagrun ? new Date(dag.next_dagrun).toLocaleString() : "None"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => setTriggerDagId(dag.dag_id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" render={<Link href={`/dags/${dag.dag_id}`} />}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Total {totalEntries} worklows
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    // Show current page, first, last, and pages around current
                    return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                  })
                  .map((p, i, arr) => {
                    const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                    return (
                      <div key={p} className="flex items-center gap-1">
                        {showEllipsis && <span className="text-muted-foreground px-1">...</span>}
                        <Button
                          variant={page === p ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPage(p)}
                          disabled={isLoading}
                        >
                          {p}
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <TriggerDialog
        dagId={triggerDagId}
        isOpen={!!triggerDagId}
        onClose={() => setTriggerDagId(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
