import { NextResponse } from 'next/server';
import { getAirflowSettings, saveAirflowSettings } from '@/lib/settings';

export async function GET() {
  const settings = getAirflowSettings();
  // Don't send the password back to the client for security, 
  // or just send a masked version.
  const { password, ...safeSettings } = settings;
  return NextResponse.json({ ...safeSettings, hasPassword: !!password });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = saveAirflowSettings(body);
    const { password, ...safeSettings } = updated;
    return NextResponse.json(safeSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
