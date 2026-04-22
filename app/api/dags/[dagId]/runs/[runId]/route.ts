import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { airflowApi } from "@/lib/airflow-client";

export async function GET(
  request: Request,
  { params }: { params: { dagId: string; runId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dagId, runId } = params;

  try {
    const data = await airflowApi.getDagRun(dagId, runId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error fetching run ${runId} for DAG ${dagId}:`, error.message);
    return NextResponse.json(
      { error: "Failed to fetch run detail", details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
