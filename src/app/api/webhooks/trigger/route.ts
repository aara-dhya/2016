import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { role, userEmail, employeeName } = body;

  let executedActions = [];

  if (role === 'ENGINEERING_ROLE' || role === 'USER') {
    executedActions.push('Invited to GitHub Repositories: nexus-corp/core-api, nexus-corp/security-infra');
  }

  if (role === 'MANAGER_ROLE' || role === 'ADMIN') {
    executedActions.push('Pushed Kisi API Update: Granted NFC Badge Access to Executive Suites & Server Rooms');
  }

  const logEntry = await prisma.webhookLog.create({
    data: {
      timestamp: new Date().toISOString(),
      triggerType: role.includes('ENGINEERING') ? 'GITHUB_API_INVITE' : 'KISI_PHYSICAL_ACCESS',
      role: role,
      userEmail: userEmail || 'employee@nexus.corp',
      actionExecuted: executedActions.join(' | ') || 'Synchronized Web2 API Permissions',
      status: 'SUCCESS_200'
    }
  });

  return NextResponse.json({
    success: true,
    triggeredWebhook: logEntry
  });
}
