
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { airflowApi } from "@/lib/airflow-client";

export async function GET(
  req: Request,
  { params }: { params: { dagId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dagId } = params;

  try {
    const data = await airflowApi.getDagTasks(dagId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error fetching tasks for DAG ${dagId}:`, error.message);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
