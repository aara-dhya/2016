import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany();
    const assets = await prisma.asset.findMany();
    const webhooks = await prisma.webhookLog.findMany();

    const identities = employees.map(e => ({
      did: e.did,
      walletAddress: e.walletAddress,
      name: e.name,
      metadataURI: 'ipfs://' + e.email,
      isRegistered: true,
      isRevoked: false,
      createdAt: Date.now(),
      assignedRole: e.role + '_ROLE'
    }));

    const formattedAssets = assets.map(a => ({
      tokenId: a.tokenId,
      name: a.name,
      description: a.description,
      serialNumber: a.serialNumber,
      issuanceDate: Date.now(),
      assetType: a.assetType,
      isLocked: a.isLocked,
      ownerDID: a.ownerDID,
      creator: 'SYSTEM',
      ownerAddress: '0x'
    }));

    const auditLogs = webhooks.map(w => ({
      id: w.id,
      timestamp: new Date(w.timestamp).getTime(),
      actionType: w.triggerType,
      actor: w.userEmail,
      target: w.role,
      details: w.actionExecuted
    }));

    return NextResponse.json({ identities, assets: formattedAssets, auditLogs });
  } catch (error) {
    console.error('Failed to fetch system state:', error);
    return NextResponse.json({ identities: [], assets: [], auditLogs: [] }, { status: 500 });
  }
}
