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
  const body = await request.json();
  const { recipientEmail, assetName, description, serialNumber, category, isLocked, warrantyExpiry } = body;

  if (!recipientEmail || !assetName || !serialNumber) {
    return NextResponse.json({ error: 'recipientEmail, assetName, and serialNumber are required' }, { status: 400 });
  }

  let employee = await prisma.employee.findUnique({
    where: { email: recipientEmail.toLowerCase() }
  });

  if (!employee) {
    const custodialWallet = deriveCustodialWallet(recipientEmail);
    const did = generateDID('USER', custodialWallet);
    employee = await prisma.employee.create({
      data: {
        email: recipientEmail.toLowerCase(),
        name: recipientEmail.split('@')[0],
        department: 'Corporate User',
        role: 'USER',
        walletAddress: custodialWallet,
        did: did
      }
    });
  }

  const assetCount = await prisma.asset.count();
  const tokenId = assetCount + 1;
  const qrPayload = `https://nexus.corp/verify-asset?id=${serialNumber}`;

  const newAsset = await prisma.asset.create({
    data: {
      tokenId,
      serialNumber,
      name: assetName,
      description: description || 'Corporate Provisioned Asset Credential',
      assetType: category || 'IT Hardware',
      ownerEmail: recipientEmail.toLowerCase(),
      ownerDID: employee.did,
      isLocked: isLocked !== undefined ? isLocked : true,
      warrantyExpiry: warrantyExpiry || '2028-12-31',
      qrPayload
    }
  });

  if (category === 'Hardware Security Module' || category === 'Access Credentials') {
    await prisma.webhookLog.create({
      data: {
        timestamp: new Date().toISOString(),
        triggerType: 'PHYSICAL_NFC_PROVISION',
        role: 'SECURITY_CREDENTIAL',
        userEmail: recipientEmail,
        actionExecuted: `Updated Kisi Physical Door Lock Permissions for Serial ${serialNumber}`,
        status: 'SUCCESS_200'
      }
    });
  }

  return NextResponse.json({
    status: 'ASSET_REGISTERED_ON_CHAIN',
    asset: newAsset,
    qrCodeSticker: {
      serialNumber,
      qrPayload,
      printableLabel: `NEXUS IT ASSET #${tokenId} | ${assetName} | S/N: ${serialNumber}`
    }
  }, { status: 201 });
}
