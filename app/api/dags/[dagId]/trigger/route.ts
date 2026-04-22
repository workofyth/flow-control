import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { airflowApi } from "@/lib/airflow-client";

export async function POST(
  request: Request,
  { params }: { params: { dagId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dagId } = params;
  const body = await request.json();
  const { conf } = body;

  const user = session.user as any;
  if (user.role !== 'superadmin' && !user.allowedDags.includes(dagId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await airflowApi.triggerDag(dagId, conf || {});
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error triggering DAG:", error.message);
    return NextResponse.json(
      { error: "Failed to trigger DAG" },
      { status: 500 }
    );
  }
}
