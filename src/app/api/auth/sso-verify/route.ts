import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function deriveCustodialWallet(email: string) {
  const hash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
  return '0x' + hash.substring(0, 40);
}

function generateDID(role: string, wallet: string) {
  return `did:nexus:${role.toLowerCase()}:${wallet}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
    }

    // Lookup token
    const magicLink = await prisma.magicLink.findUnique({
      where: { token }
    });

    if (!magicLink) {
      return NextResponse.json({ error: 'Invalid or expired magic link.' }, { status: 400 });
    }

    if (magicLink.expiresAt < new Date()) {
      await prisma.magicLink.delete({ where: { id: magicLink.id } });
      return NextResponse.json({ error: 'Magic link has expired.' }, { status: 400 });
    }

    // Token is valid! Delete it so it can't be reused.
    await prisma.magicLink.delete({ where: { id: magicLink.id } });

    // Ensure the employee exists
    let employee = await prisma.employee.findUnique({
      where: { email: magicLink.email }
    });

    if (!employee) {
      const custodialWallet = deriveCustodialWallet(magicLink.email);
      const did = generateDID('USER', custodialWallet);
      
      employee = await prisma.employee.create({
        data: {
          email: magicLink.email,
          name: magicLink.name || magicLink.email.split('@')[0],
          department: magicLink.department || 'Corporate User',
          role: 'USER',
          walletAddress: custodialWallet,
          did: did
        }
      });

      // Record system webhook log for onboarding
      await prisma.webhookLog.create({
        data: {
          timestamp: new Date().toISOString(),
          triggerType: 'ACCOUNT_ABSTRACTION_PROVISION',
          role: 'USER_ROLE',
          userEmail: magicLink.email,
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
  } catch (err: any) {
    console.error("SSO Verify Error:", err);
    return NextResponse.json({ error: 'Failed to verify magic link.' }, { status: 500 });
  }
}
