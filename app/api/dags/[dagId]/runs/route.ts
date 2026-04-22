import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { airflowApi } from "@/lib/airflow-client";

export async function GET(
  request: Request,
  { params }: { params: { dagId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dagId } = params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const user = session.user as any;
  if (user.role !== 'superadmin' && !user.allowedDags.includes(dagId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await airflowApi.getDagRuns(dagId, limit, offset);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch DAG runs" },
      { status: 500 }
    );
  }
}
