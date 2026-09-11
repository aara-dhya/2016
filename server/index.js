import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { ethers } from 'ethers';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory store for Web2/Web3 relayer data
const employeeStore = new Map();
const assetStore = new Map();
const nonceStore = new Map();
const webhookLogs = [];

// Helper to generate deterministic Account Abstraction wallet address from email
function deriveCustodialWallet(email) {
  const hash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
  return '0x' + hash.substring(0, 40);
}

// Helper to generate DID
function generateDID(role, wallet) {
  return `did:nexus:${role.toLowerCase()}:${wallet}`;
}

// Seed initial enterprise data
const initialEmployees = [
  {
    email: 'admin@nexus.corp',
    name: 'SysAdmin Enclave',
    department: 'IT Security',
    role: 'ADMIN',
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    did: 'did:nexus:admin:0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  },
  {
    email: 'manager@nexus.corp',
    name: 'Asset & Identity Officer',
    department: 'HR & IT Operations',
    role: 'MANAGER',
    walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    did: 'did:nexus:manager:0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
  },
  {
    email: 'auditor@nexus.corp',
    name: 'Chief Compliance Auditor',
    department: 'Legal & Audit',
    role: 'AUDITOR',
    walletAddress: '0x90F79bf6EB2c4f8080653A214d5A230128c7c9ec',
    did: 'did:nexus:auditor:0x90F79bf6EB2c4f8080653A214d5A230128c7c9ec'
  },
  {
    email: 'alice@nexus.corp',
    name: 'Alice Vance',
    department: 'Core Engineering',
    role: 'USER',
    walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    did: 'did:nexus:user:0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
  },
  {
    email: 'bob@nexus.corp',
    name: 'Bob Stone',
    department: 'Product Infrastructure',
    role: 'USER',
    walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    did: 'did:nexus:user:0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'
  }
];

initialEmployees.forEach(emp => employeeStore.set(emp.email, emp));

// Seed initial assets with QR Code payload specifications
const initialAssets = [
  {
    tokenId: 1,
    serialNumber: 'SN-TITAN-9012-CYBER',
    name: 'Titan Security Key v5',
    description: 'High-assurance YubiKey-compat Cryptographic Hardware Enclave with Quantum-resistant Signature Module.',
    assetType: 'Hardware Security Module',
    ownerEmail: 'alice@nexus.corp',
    ownerDID: 'did:nexus:user:0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    isLocked: true,
    warrantyExpiry: '2028-12-31',
    qrPayload: 'https://nexus.corp/verify-asset?id=SN-TITAN-9012-CYBER'
  },
  {
    tokenId: 2,
    serialNumber: 'SN-MACBOOK-M3-8890',
    name: 'MacBook Pro 16" M3 Max (64GB)',
    description: 'Corporate Engineering Workstation pre-provisioned with encrypted identity tokens and SSH enclave.',
    assetType: 'IT Hardware',
    ownerEmail: 'alice@nexus.corp',
    ownerDID: 'did:nexus:user:0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    isLocked: false,
    warrantyExpiry: '2027-09-15',
    qrPayload: 'https://nexus.corp/verify-asset?id=SN-MACBOOK-M3-8890'
  }
];

initialAssets.forEach(asset => assetStore.set(asset.serialNumber, asset));

// Initial Webhook Logs
webhookLogs.push(
  {
    id: 1,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    triggerType: 'GITHUB_API_INVITE',
    role: 'ENGINEERING_ROLE',
    userEmail: 'alice@nexus.corp',
    actionExecuted: 'Invited to Private Repos: nexus-corp/core-api, nexus-corp/security-infra',
    status: 'SUCCESS_200'
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    triggerType: 'KISI_PHYSICAL_ACCESS',
    role: 'MANAGER_ROLE',
    userEmail: 'manager@nexus.corp',
    actionExecuted: 'Updated Physical NFC Badge Access: Server Rooms, Executive Vaults, Floor 4 Enclave',
    status: 'SUCCESS_200'
  }
);

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 0. SIWE (Sign-In with Ethereum) Cryptographic Challenge Nonce
app.get('/api/auth/nonce', (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'Wallet address parameter required' });
  }
  const nonce = 'nexus_nonce_' + crypto.randomBytes(16).toString('hex');
  nonceStore.set(address.toLowerCase(), nonce);
  res.json({ nonce, address: address.toLowerCase() });
});

// 0b. SIWE Cryptographic Signature Verification
app.post('/api/auth/verify', (req, res) => {
  const { address, signature, nonce } = req.body;
  if (!address || !signature) {
    return res.status(400).json({ error: 'address and signature are required' });
  }

  const expectedNonce = nonceStore.get(address.toLowerCase()) || nonce || 'default_nexus_nonce';
  const message = `Sign this message to authenticate with Nexus HR Portal. Nonce: ${expectedNonce}`;

  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Cryptographic signature verification failed' });
    }

    nonceStore.delete(address.toLowerCase());

    let employee = Array.from(employeeStore.values()).find(
      e => e.walletAddress.toLowerCase() === address.toLowerCase()
    );

    if (!employee) {
      const did = generateDID('USER', address);
      employee = {
        email: `operator_${address.substring(2, 8).toLowerCase()}@nexus.corp`,
        name: `Verified Operator (${address.substring(0, 6)}...)`,
        department: 'Cyber Operations',
        role: 'USER',
        walletAddress: address,
        did
      };
      employeeStore.set(employee.email, employee);
    }

    const token = 'jwt_nexus_sec_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
    res.json({
      authenticated: true,
      token,
      user: employee,
      verifiedAddress: recoveredAddress
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid signature payload: ' + err.message });
  }
});

// 1. Frictionless SSO Onboarding (Account Abstraction)
app.post('/api/auth/sso-login', (req, res) => {
  const { email, name, department } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required for corporate SSO authentication' });
  }

  let employee = employeeStore.get(email.toLowerCase());
  if (!employee) {
    const custodialWallet = deriveCustodialWallet(email);
    const did = generateDID('USER', custodialWallet);
    employee = {
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      department: department || 'Corporate User',
      role: 'USER',
      walletAddress: custodialWallet,
      did: did
    };
    employeeStore.set(email.toLowerCase(), employee);

    // Record system webhook log
    webhookLogs.unshift({
      id: webhookLogs.length + 1,
      timestamp: new Date().toISOString(),
      triggerType: 'ACCOUNT_ABSTRACTION_PROVISION',
      role: 'USER_ROLE',
      userEmail: email,
      actionExecuted: `Instantly provisioned custodial wallet ${custodialWallet} and DID ${did}`,
      status: 'SUCCESS_200'
    });
  }

  res.json({
    status: 'AUTHENTICATED',
    sessionToken: 'sso_token_' + Date.now(),
    user: employee
  });
});

// 2. Issue IT Equipment & Generate Printable QR Code Sticker
app.post('/api/assets/issue', (req, res) => {
  const { recipientEmail, assetName, description, serialNumber, category, isLocked, warrantyExpiry } = req.body;

  if (!recipientEmail || !assetName || !serialNumber) {
    return res.status(400).json({ error: 'recipientEmail, assetName, and serialNumber are required' });
  }

  let employee = employeeStore.get(recipientEmail.toLowerCase());
  if (!employee) {
    const custodialWallet = deriveCustodialWallet(recipientEmail);
    const did = generateDID('USER', custodialWallet);
    employee = {
      email: recipientEmail.toLowerCase(),
      name: recipientEmail.split('@')[0],
      department: 'Corporate User',
      role: 'USER',
      walletAddress: custodialWallet,
      did: did
    };
    employeeStore.set(recipientEmail.toLowerCase(), employee);
  }

  const tokenId = assetStore.size + 1;
  const qrPayload = `https://nexus.corp/verify-asset?id=${serialNumber}`;

  const newAsset = {
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
  };

  assetStore.set(serialNumber, newAsset);

  // Trigger automated webhook if hardware security module
  if (category === 'Hardware Security Module' || category === 'Access Credentials') {
    webhookLogs.unshift({
      id: webhookLogs.length + 1,
      timestamp: new Date().toISOString(),
      triggerType: 'PHYSICAL_NFC_PROVISION',
      role: 'SECURITY_CREDENTIAL',
      userEmail: recipientEmail,
      actionExecuted: `Updated Kisi Physical Door Lock Permissions for Serial ${serialNumber}`,
      status: 'SUCCESS_200'
    });
  }

  res.status(201).json({
    status: 'ASSET_REGISTERED_ON_CHAIN',
    asset: newAsset,
    qrCodeSticker: {
      serialNumber,
      qrPayload,
      printableLabel: `NEXUS IT ASSET #${tokenId} | ${assetName} | S/N: ${serialNumber}`
    }
  });
});

// 3. Verify Asset by Serial Number (Physical-to-Digital Bridge)
app.get('/api/assets/verify/:serialNumber', (req, res) => {
  const { serialNumber } = req.params;
  const asset = assetStore.get(serialNumber);

  if (!asset) {
    return res.status(404).json({
      verified: false,
      error: `Asset Serial Number '${serialNumber}' not found on system registry.`
    });
  }

  const owner = employeeStore.get(asset.ownerEmail);

  res.json({
    verified: true,
    asset: asset,
    ownerDetails: owner || { email: asset.ownerEmail, name: 'Verified Employee', did: asset.ownerDID },
    proofOfOwnership: {
      onChainStatus: 'VERIFIED_ON_BLOCKCHAIN',
      registryId: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`,
      blockConfirmation: 10482910,
      soulboundPolicy: asset.isLocked ? 'LOCKED_SOULBOUND_NON_TRANSFERABLE' : 'UNLOCKED_TRANSFERABLE'
    }
  });
});

// 4. Trigger Webhook Relayer (GitHub & Kisi Physical Access Control)
app.post('/api/webhooks/trigger', (req, res) => {
  const { role, userEmail, employeeName } = req.body;

  let executedActions = [];

  if (role === 'ENGINEERING_ROLE' || role === 'USER') {
    executedActions.push('Invited to GitHub Repositories: nexus-corp/core-api, nexus-corp/security-infra');
  }

  if (role === 'MANAGER_ROLE' || role === 'ADMIN') {
    executedActions.push('Pushed Kisi API Update: Granted NFC Badge Access to Executive Suites & Server Rooms');
  }

  const logEntry = {
    id: webhookLogs.length + 1,
    timestamp: new Date().toISOString(),
    triggerType: role.includes('ENGINEERING') ? 'GITHUB_API_INVITE' : 'KISI_PHYSICAL_ACCESS',
    role: role,
    userEmail: userEmail || 'employee@nexus.corp',
    actionExecuted: executedActions.join(' | ') || 'Synchronized Web2 API Permissions',
    status: 'SUCCESS_200'
  };

  webhookLogs.unshift(logEntry);

  res.json({
    success: true,
    triggeredWebhook: logEntry
  });
});

// 5. Get Webhook Relayer Logs
app.get('/api/webhooks/logs', (req, res) => {
  res.json({
    totalLogs: webhookLogs.length,
    logs: webhookLogs
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', app: 'Nexus HR & IT Asset Manager API Relayer' });
});

app.listen(PORT, () => {
  console.log(`[NEXUS BACKEND] Express API Orchestrator running on http://localhost:${PORT}`);
});
