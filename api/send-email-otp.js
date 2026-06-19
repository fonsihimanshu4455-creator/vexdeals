/**
 * Vercel Serverless Function — POST /api/send-email-otp
 * Sends a 6-digit OTP to the user's email via Resend.
 *
 * Stateless & secure: the OTP is never stored. We return a signed token
 * (HMAC of email+otp+expiry) to the browser; /api/verify-email-otp re-signs
 * the submitted OTP and compares. No database needed.
 *
 * Required env var (set in Vercel): RESEND_API_KEY
 * Optional: OTP_SECRET (signing key), OTP_FROM_EMAIL (verified sender)
 */
import { createHmac, randomInt } from 'crypto';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email OTP not configured yet. Add RESEND_API_KEY in Vercel project settings.' });
  }

  const secret = process.env.OTP_SECRET || 'vexdeals-otp-signing-default';
  const from = process.env.OTP_FROM_EMAIL || 'VexDeals <onboarding@resend.dev>';

  const otp = String(randomInt(0, 1000000)).padStart(6, '0');
  const expiry = Date.now() + OTP_TTL_MS;
  const sig = createHmac('sha256', secret).update(`${email}|${otp}|${expiry}`).digest('hex');
  const token = `${Buffer.from(`${email}|${expiry}`).toString('base64url')}.${sig}`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f7f9fc;border-radius:16px">
    <div style="text-align:center;margin-bottom:16px">
      <span style="font-size:22px;font-weight:800;color:#009fb7">Vex</span><span style="font-size:22px;font-weight:800;color:#0f2740">Deals</span>
    </div>
    <div style="background:#fff;border-radius:14px;padding:28px;text-align:center;border:1px solid #eef1f6">
      <p style="color:#5b6b7c;font-size:14px;margin:0 0 8px">Your verification code is</p>
      <p style="font-size:38px;font-weight:800;letter-spacing:8px;color:#0f2740;margin:8px 0">${otp}</p>
      <p style="color:#8a98a8;font-size:13px;margin:12px 0 0">Valid for 10 minutes. Don't share this code with anyone.</p>
    </div>
    <p style="color:#9aa7b5;font-size:12px;text-align:center;margin-top:16px">If you didn't request this, you can ignore this email.</p>
  </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `${otp} is your VexDeals verification code`,
        html,
      }),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return res.status(502).json({ error: e?.message || 'Could not send the email. Check your Resend key / sender address.' });
    }
  } catch {
    return res.status(500).json({ error: 'Email sending failed. Please try again.' });
  }

  return res.status(200).json({ token, expiresAt: expiry });
}
