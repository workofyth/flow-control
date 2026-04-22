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
  const user = session.user as any;

  // Check permissions
  if (user.role !== 'superadmin' && !user.allowedDags.includes(dagId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await airflowApi.getDag(dagId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch DAG detail" },
      { status: 500 }
    );
  }
}
