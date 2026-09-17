import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Wallet address parameter required' }, { status: 400 });
  }

  const nonce = 'nexus_nonce_' + crypto.randomBytes(16).toString('hex');
  
  await prisma.nonce.upsert({
    where: { address: address.toLowerCase() },
    update: { nonce },
    create: { address: address.toLowerCase(), nonce }
  });

  return NextResponse.json({ nonce, address: address.toLowerCase() });
}
