import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, department } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required for corporate SSO authentication' }, { status: 400 });
    }

    // Generate Magic Token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save to DB
    await prisma.magicLink.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        department: department || null,
        token,
        expiresAt,
      }
    });

    // Determine base URL
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const magicLinkUrl = `${origin}/verify?token=${token}`;

    // Send Email
    const data = await resend.emails.send({
      from: 'Nexus Security Enclave <onboarding@resend.dev>',
      to: email.toLowerCase(),
      subject: 'Login to Nexus IT Security Enclave',
      html: `
        <div style="font-family: monospace; padding: 20px; background-color: #000; color: #fff;">
          <h2 style="color: #77DD77;">NEXUS IT SECURITY ENCLAVE</h2>
          <p>A login request was initiated for your email.</p>
          <p>Click the link below to authenticate your session. This link expires in 5 minutes.</p>
          <a href="${magicLinkUrl}" style="display: inline-block; padding: 10px 20px; background-color: #77DD77; color: #000; text-decoration: none; font-weight: bold; margin-top: 20px;">AUTHENTICATE SESSION</a>
          <p style="margin-top: 30px; font-size: 10px; color: #555;">// Cryptographic Magic Link Provisioning via Account Abstraction</p>
        </div>
      `,
    });
    console.log("Resend email dispatched:", data);

    return NextResponse.json({
      status: 'MAGIC_LINK_SENT',
      message: 'Magic link dispatched to inbox.'
    });
  } catch (err: any) {
    console.error("SSO Login Error:", err);
    return NextResponse.json({ error: 'Failed to dispatch magic link.' }, { status: 500 });
  }
}
