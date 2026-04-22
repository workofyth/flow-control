import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUsers, addUser } from "@/lib/users";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'superadmin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = getUsers().map(u => {
    const { password, ...rest } = u;
    return rest;
  });
  
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'superadmin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, password, role, allowedDags } = body;
    
    if (!username || !password || !role || !allowedDags) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    addUser({ username, password, role, allowedDags });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
