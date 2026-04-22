"use client";

import { useDagDetail, useDagRuns } from "@/hooks/useDagDetail";
import { DagStatusBadge } from "@/components/dag/DagStatusBadge";
import { TriggerDialog } from "@/components/dag/TriggerDialog";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Calendar,
  User,
  Tag as TagIcon,
  FileText,
  ChevronLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { DagGraph } from "@/components/dag/DagGraph";

export default function DagDetailPage() {
  const { dagId } = useParams() as { dagId: string };
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("graph");

  const { data: dag, isLoading: isDagLoading } = useDagDetail(dagId);
  const { data: runsData, isLoading: isRunsLoading, refetch: refetchRuns } = useDagRuns(dagId);

  if (isDagLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const runs = runsData?.dag_runs || [];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="graph" className="flex-1 rounded-lg py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all font-bold tracking-tight">DAG Graph</TabsTrigger>
          <TabsTrigger value="runs" className="flex-1 rounded-lg py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all font-bold tracking-tight">Recent Runs</TabsTrigger>
          <TabsTrigger value="details" className="flex-1 rounded-lg py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all font-bold tracking-tight">Technical Details</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" render={<Link href="/dashboard" />}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{dagId}</h1>
              <DagStatusBadge status={dag?.is_paused ? "paused" : "active"} />
            </div>
            <p className="text-muted-foreground">{dag?.description || "No description provided."}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchRuns()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Runs
          </Button>
          <Button size="sm" onClick={() => setIsTriggerOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Trigger DAG
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
              <Calendar className="h-3 w-3 text-primary" />
              Schedule Interval
            </CardDescription>
            <CardTitle className="text-lg font-mono">{dag?.scheduler_type || "None"}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
              <User className="h-3 w-3 text-primary" />
              Owners
            </CardDescription>
            <CardTitle className="text-lg">{dag?.owners?.join(", ") || "Unknown"}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
              <TagIcon className="h-3 w-3 text-primary" />
              Classification Tags
            </CardDescription>
            <div className="flex flex-wrap gap-1 mt-1">
              {dag?.tags?.length > 0 ? (
                dag.tags.map((tag: any) => (
                  <span key={tag.name} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-muted-foreground italic">None</span>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="graph" className="mt-0">
          <DagGraph dagId={dagId} runId="" taskInstances={[]} />
        </TabsContent>

        <TabsContent value="runs" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-white/5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Run History</CardTitle>
                  <CardDescription>The last {runs.length} executions of this DAG</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchRuns()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100/50 dark:bg-slate-900/50 border-none">
                    <TableHead className="pl-6">Run ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Run Type</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isRunsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-6"><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right pr-6"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : runs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No runs recorded for this DAG.
                      </TableCell>
                    </TableRow>
                  ) : (
                    runs.map((run: any) => {
                      const start = run.start_date ? new Date(run.start_date) : null;
                      const end = run.end_date ? new Date(run.end_date) : null;
                      const duration = start && end ? ((end.getTime() - start.getTime()) / 1000).toFixed(2) : null;

                      return (
                        <TableRow key={run.dag_run_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-none transition-colors">
                          <TableCell className="font-mono text-[11px] pl-6 text-muted-foreground group-hover:text-primary transition-colors">{run.dag_run_id}</TableCell>
                          <TableCell>
                            <DagStatusBadge status={run.state} />
                          </TableCell>
                          <TableCell className="text-sm">
                            {start ? start.toLocaleString() : "Pending"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono">
                            {duration ? `${duration}s` : "-"}
                          </TableCell>
                          <TableCell>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {run.run_type}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="sm" className="hover:bg-primary/5 hover:text-primary" render={<Link href={`/dags/${dagId}/runs/${run.dag_run_id}`} />}>
                              View Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-white/5 py-4">
              <CardTitle>Technical DAG Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Source File Location</span>
                  <div className="text-sm font-mono break-all bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {dag?.fileloc}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Schedule Expression</span>
                  <div className="text-sm flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Calendar className="h-4 w-4 text-primary" />
                    {dag?.scheduler_type || "None"}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Next Execution Plan</span>
                  <div className="text-sm flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Clock className="h-4 w-4 text-primary" />
                    {dag?.next_dagrun ? new Date(dag.next_dagrun).toLocaleString() : "Manual only"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TriggerDialog
        dagId={dagId}
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
        onSuccess={() => refetchRuns()}
      />
    </div>
  );
}
