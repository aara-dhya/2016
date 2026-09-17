import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Helper to generate deterministic Account Abstraction wallet address from email
function deriveCustodialWallet(email: string) {
  const hash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
  return '0x' + hash.substring(0, 40);
}

// Helper to generate DID
function generateDID(role: string, wallet: string) {
  return `did:nexus:${role.toLowerCase()}:${wallet}`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, name, department } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email is required for corporate SSO authentication' }, { status: 400 });
  }

  let employee = await prisma.employee.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!employee) {
    const custodialWallet = deriveCustodialWallet(email);
    const did = generateDID('USER', custodialWallet);
    
    employee = await prisma.employee.create({
      data: {
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        department: department || 'Corporate User',
        role: 'USER',
        walletAddress: custodialWallet,
        did: did
      }
    });

    // Record system webhook log
    await prisma.webhookLog.create({
      data: {
        timestamp: new Date().toISOString(),
        triggerType: 'ACCOUNT_ABSTRACTION_PROVISION',
        role: 'USER_ROLE',
        userEmail: email,
        actionExecuted: `Instantly provisioned custodial wallet ${custodialWallet} and DID ${did}`,
        status: 'SUCCESS_200'
      }
    });
  }

  return NextResponse.json({
    status: 'AUTHENTICATED',
    sessionToken: 'sso_token_' + Date.now(),
    user: employee
  });
}
