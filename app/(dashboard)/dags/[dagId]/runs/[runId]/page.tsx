"use client";

import { useRunDetail, useTaskInstances } from "@/hooks/useRunDetail";
import { DagStatusBadge } from "@/components/dag/DagStatusBadge";
import { useParams } from "next/navigation";
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
import { ChevronLeft, Terminal, Clock, Calendar, Info } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { DagGraph } from "@/components/dag/DagGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RunDetailPage() {
  const { dagId, runId } = useParams() as { dagId: string; runId: string };
  
  const { data: run, isLoading: isRunLoading } = useRunDetail(dagId, runId);
  const { data: tasksData, isLoading: isTasksLoading } = useTaskInstances(dagId, runId);

  if (isRunLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const tasks = tasksData?.task_instances || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href={`/dags/${dagId}`} />}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Run Details</h1>
          <p className="text-muted-foreground font-mono text-sm">{runId}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle>
              <DagStatusBadge status={run?.state} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Start Date
            </CardDescription>
            <CardTitle className="text-sm">
              {run?.start_date ? new Date(run.start_date).toLocaleString() : "Pending"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-3 w-3" /> End Date
            </CardDescription>
            <CardTitle className="text-sm">
              {run?.end_date ? new Date(run.end_date).toLocaleString() : "-"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Info className="h-3 w-3" /> Run Type
            </CardDescription>
            <CardTitle className="text-sm uppercase">{run?.run_type}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="graph" className="w-full">
        <div className="flex flex-col gap-8">
          <TabsList className="flex w-full bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <TabsTrigger value="graph" className="flex-1 rounded-lg py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all font-bold tracking-tight">Execution Graph</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1 rounded-lg py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg transition-all font-bold tracking-tight">Task Instances</TabsTrigger>
          </TabsList>

          <TabsContent value="graph" className="m-0">
            <DagGraph dagId={dagId} runId={runId} taskInstances={tasks} />
          </TabsContent>

          <TabsContent value="tasks" className="m-0">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-white/5 py-4">
                <CardTitle>Task Detail List</CardTitle>
                <CardDescription>Individual components and their execution state</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100/50 dark:bg-slate-900/50 border-none">
                      <TableHead className="pl-6">Task ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Attempt</TableHead>
                      <TableHead className="text-right pr-6">Logs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isTasksLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="pl-6"><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="text-right pr-6"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      tasks.map((task: any) => (
                        <TableRow key={task.task_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-none transition-colors">
                          <TableCell className="font-medium pl-6 group-hover:text-primary transition-colors">{task.task_id}</TableCell>
                          <TableCell>
                            <DagStatusBadge status={task.state || "none"} />
                          </TableCell>
                          <TableCell className="text-[11px] font-mono text-muted-foreground">{task.operator}</TableCell>
                          <TableCell className="text-sm font-mono text-muted-foreground">
                            {task.duration ? `${task.duration.toFixed(2)}s` : "-"}
                          </TableCell>
                          <TableCell className="text-sm">#{task.try_number}</TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-primary/5 hover:text-primary"
                              render={<Link href={`/dags/${dagId}/logs?runId=${runId}&taskId=${task.task_id}&tryNumber=${task.try_number}`} />}
                            >
                              <Terminal className="mr-2 h-4 w-4" />
                              View Logs
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {run?.conf && Object.keys(run.conf).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-slate-900 text-slate-50 rounded-lg text-xs overflow-auto">
              {JSON.stringify(run.conf, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
