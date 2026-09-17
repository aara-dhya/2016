import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Helper to generate DID
function generateDID(role: string, wallet: string) {
  return `did:nexus:${role.toLowerCase()}:${wallet}`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { address, signature, nonce } = body;

  if (!address || !signature) {
    return NextResponse.json({ error: 'address and signature are required' }, { status: 400 });
  }

  const storedNonceEntry = await prisma.nonce.findUnique({
    where: { address: address.toLowerCase() }
  });
  
  const expectedNonce = storedNonceEntry?.nonce || nonce || 'default_nexus_nonce';
  const message = `Sign this message to authenticate with Nexus HR Portal. Nonce: ${expectedNonce}`;

  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: 'Cryptographic signature verification failed' }, { status: 401 });
    }

    if (storedNonceEntry) {
      await prisma.nonce.delete({ where: { address: address.toLowerCase() } });
    }

    let employee = await prisma.employee.findUnique({
      where: { walletAddress: address }
    });

    if (!employee) {
      const did = generateDID('USER', address);
      employee = await prisma.employee.create({
        data: {
          email: `operator_${address.substring(2, 8).toLowerCase()}@nexus.corp`,
          name: `Verified Operator (${address.substring(0, 6)}...)`,
          department: 'Cyber Operations',
          role: 'USER',
          walletAddress: address,
          did
        }
      });
    }

    const token = 'jwt_nexus_sec_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
    return NextResponse.json({
      authenticated: true,
      token,
      user: employee,
      verifiedAddress: recoveredAddress
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid signature payload: ' + err.message }, { status: 400 });
  }
}
