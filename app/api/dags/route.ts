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
  const search = searchParams.get("search") || undefined;
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");

  const user = session.user as any;

  try {
    const isSuperAdmin = user.role === 'superadmin';
    const allowedDags = user.allowedDags || [];
    const hasWildcard = allowedDags.includes('*');

    let dags: any[] = [];
    let totalEntries = 0;

    if (isSuperAdmin || hasWildcard) {
      // Superadmin or wildcard user gets everything (filtered by search if provided)
      if (limit === -1) {
        const allData = await airflowApi.getAllDags();
        dags = allData.dags;
        totalEntries = allData.total_entries;
        
        // Manual search filter if limit is -1
        if (search) {
          const searchLower = search.toLowerCase();
          dags = dags.filter((dag: any) => 
            dag.dag_id.toLowerCase().includes(searchLower) ||
            dag.tags?.some((t: any) => t.name.toLowerCase().includes(searchLower))
          );
          totalEntries = dags.length;
        }
      } else {
        const data = await airflowApi.getDags(limit, offset, search);
        dags = data.dags;
        totalEntries = data.total_entries;
      }
    } else {
      // Regular user: fetch all and filter by their allowed list
      const allData = await airflowApi.getAllDags();
      
      let filteredDags = allData.dags.filter((dag: any) => 
        allowedDags.includes(dag.dag_id)
      );

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredDags = filteredDags.filter((dag: any) => 
          dag.dag_id.toLowerCase().includes(searchLower) ||
          dag.tags?.some((t: any) => t.name.toLowerCase().includes(searchLower))
        );
      }

      totalEntries = filteredDags.length;
      dags = limit === -1 ? filteredDags : filteredDags.slice(offset, offset + limit);
    }

    return NextResponse.json({
      dags,
      total_entries: totalEntries
    });
  } catch (error: any) {
    console.error("Error fetching DAGs:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch DAGs from Airflow", details: error.message },
      { status: 500 }
    );
  }
}
