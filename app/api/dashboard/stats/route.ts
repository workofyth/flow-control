import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { airflowApi } from "@/lib/airflow-client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    // Fetch 500 most recent dag runs across all DAGs
    const data = await airflowApi.getGlobalDagRuns(500);
    let runs = data.dag_runs || [];

    // Filter by user permissions
    if (user.role !== 'superadmin') {
      const allowed = user.allowedDags || [];
      if (!allowed.includes('*')) {
        runs = runs.filter((run: any) => allowed.includes(run.dag_id));
      }
    }

    // Calculate stats
    const successCount = runs.filter((run: any) => run.state === 'success').length;
    const failedCount = runs.filter((run: any) => run.state === 'failed').length;

    // Calculate longest runs
    const dagDurations = new Map<string, { dagId: string, duration: number, runId: string, endDate: string | null }>();

    runs.forEach((run: any) => {
      if (run.start_date) {
        const start = new Date(run.start_date).getTime();
        const end = run.end_date ? new Date(run.end_date).getTime() : Date.now();
        const duration = (end - start) / 1000; // seconds

        // Only keep the latest run's duration for each DAG to find the "currently" longest
        if (!dagDurations.has(run.dag_id)) {
          dagDurations.set(run.dag_id, {
            dagId: run.dag_id,
            duration,
            runId: run.dag_run_id,
            endDate: run.end_date || null
          });
        }
      }
    });

    const longestDags = Array.from(dagDurations.values())
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return NextResponse.json({
      successCount,
      failedCount,
      longestDags,
      totalScanned: runs.length,
      user: {
        role: user.role,
        allowedCount: user.allowedDags?.length
      }
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error.message);
    return NextResponse.json({ 
      error: "Failed to fetch stats", 
      details: error.message 
    }, { status: 500 });
  }
}
