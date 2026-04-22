"use client";

import { useLogs } from "@/hooks/useLogs";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Download, RefreshCw, Terminal } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LogsPage() {
  const { dagId } = useParams() as { dagId: string };
  const searchParams = useSearchParams();
  const runId = searchParams.get("runId") || "";
  const taskId = searchParams.get("taskId") || "";
  const tryNumber = parseInt(searchParams.get("tryNumber") || "1");

  const { data: logs, isLoading, refetch, isFetching } = useLogs(dagId, runId, taskId, tryNumber);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" render={<Link href={`/dags/${dagId}${runId ? `/runs/${runId}` : ''}`} />}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Task Logs: <span className="text-primary">{taskId || "Loading..."}</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Run: <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{runId}</span> • Try: {tryNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Card className="flex-1 min-h-0 bg-[#0f1117] text-slate-300 border-none shadow-2xl overflow-hidden ring-1 ring-white/10">
        <CardHeader className="py-3 px-4 border-b border-white/5 bg-[#161b22]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-xs font-mono text-slate-500 ml-2">airflow-task-log.txt</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              UTF-8 • Log Preview
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100vh-280px)]">
          <ScrollArea ref={scrollRef} className="h-full w-full font-mono text-xs p-6 leading-relaxed">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin opacity-20" />
                <span className="animate-pulse">Streaming logs from Airflow...</span>
              </div>
            ) : (
              <div className="space-y-0.5">
                {(logs || "No logs available for this task instance.").split('\n').map((line: string, i: number) => {
                  let colorClass = "text-slate-400";
                  if (line.includes("INFO")) colorClass = "text-blue-400";
                  if (line.includes("WARNING")) colorClass = "text-amber-400";
                  if (line.includes("ERROR") || line.includes("FAILED")) colorClass = "text-rose-400";
                  if (line.includes("SUCCESS")) colorClass = "text-emerald-400";

                  return (
                    <div key={i} className="flex gap-4 group hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                      <span className="shrink-0 w-8 text-right text-slate-600 select-none group-hover:text-slate-500">{i + 1}</span>
                      <pre className={`whitespace-pre-wrap break-all ${colorClass}`}>{line}</pre>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
