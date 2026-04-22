import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { airflowApi } from "@/lib/airflow-client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dagId = searchParams.get("dagId");
  const runId = searchParams.get("runId");
  const taskId = searchParams.get("taskId");
  const tryNumber = parseInt(searchParams.get("tryNumber") || "1");

  if (!dagId || !runId || !taskId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const user = session.user as any;
  if (user.role !== 'superadmin' && !user.allowedDags.includes(dagId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await airflowApi.getTaskLog(dagId, runId, taskId, tryNumber);
    return new NextResponse(data, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error: any) {
    console.error("Error fetching logs:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
