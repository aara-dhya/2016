import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logs = await prisma.webhookLog.findMany({
    orderBy: {
      id: 'desc'
    }
  });

  return NextResponse.json({
    totalLogs: logs.length,
    logs: logs
  });
}
