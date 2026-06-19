/**
 * Vercel Serverless Function — POST /api/verify-email-otp
 * Verifies the 6-digit OTP against the signed token from /api/send-email-otp.
 * Stateless — recomputes the HMAC and compares in constant time.
 */
import { createHmac, timingSafeEqual } from 'crypto';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const email = String(req.body?.email || '').trim().toLowerCase();
  const otp = String(req.body?.otp || '').trim();
  const token = String(req.body?.token || '');

  if (!email || !otp || !token) {
    return res.status(400).json({ success: false, error: 'Missing email, OTP or token.' });
  }

  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return res.status(400).json({ success: false, error: 'Invalid session. Request a new code.' });

  let payload;
  try { payload = Buffer.from(b64, 'base64url').toString('utf8'); }
  catch { return res.status(400).json({ success: false, error: 'Invalid session. Request a new code.' }); }

  const [tEmail, tExpiry] = payload.split('|');
  if (tEmail !== email) return res.status(400).json({ success: false, error: 'Email does not match this code.' });
  if (!tExpiry || Date.now() > Number(tExpiry)) {
    return res.status(400).json({ success: false, error: 'Code expired. Please request a new one.' });
  }

  const secret = process.env.OTP_SECRET || 'vexdeals-otp-signing-default';
  const expected = createHmac('sha256', secret).update(`${email}|${otp}|${tExpiry}`).digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  const ok = a.length === b.length && timingSafeEqual(a, b);

  if (ok) return res.status(200).json({ success: true });
  return res.status(400).json({ success: false, error: 'Wrong code. Please try again.' });
}
