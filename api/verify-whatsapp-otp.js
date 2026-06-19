/**
 * Vercel Serverless Function — POST /api/verify-whatsapp-otp
 * Verifies a mobile OTP against MSG91 (which generated & stored it).
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const cleaned = String(req.body?.phone || '').replace(/\D/g, '').slice(-10);
  const otp = String(req.body?.otp || '').replace(/\D/g, '');

  if (cleaned.length !== 10 || !otp) {
    return res.status(400).json({ error: 'Missing phone number or OTP.' });
  }

  const AUTH = process.env.MSG91_AUTH_KEY;

  // Dev mode — no keys: accept any code so the flow stays testable locally.
  if (!AUTH) {
    return res.status(200).json({ success: true, dev: true });
  }

  try {
    const url = `https://control.msg91.com/api/v5/otp/verify?otp=${encodeURIComponent(otp)}&mobile=91${cleaned}`;
    const resp = await fetch(url, { headers: { authkey: AUTH } });
    const data = await resp.json();
    if (data?.type === 'success') return res.status(200).json({ success: true });
    return res.status(400).json({ error: data?.message || 'Incorrect OTP. Please try again.' });
  } catch (err) {
    console.error('MSG91 verify error:', err);
    return res.status(500).json({ error: 'Verification service unavailable. Please try again.' });
  }
}
