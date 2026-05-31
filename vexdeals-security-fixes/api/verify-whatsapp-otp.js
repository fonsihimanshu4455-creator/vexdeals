import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!OTP_SECRET) {
    return res.status(500).json({ error: 'OTP service not configured. Set OTP_SECRET in Vercel.' });
  }

  const { phone, otp, token } = req.body || {};
  const cleaned = String(phone || '').replace(/\D/g, '').slice(-10);

  if (!cleaned || !otp || !token) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const dotIdx = token.indexOf('.');
  if (dotIdx === -1) return res.status(400).json({ error: 'Invalid token.' });

  const expiry = parseInt(token.slice(0, dotIdx), 10);
  const sig    = token.slice(dotIdx + 1);

  if (!Number.isFinite(expiry) || Date.now() > expiry) {
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  const expected = crypto
    .createHmac('sha256', OTP_SECRET)
    .update(`${cleaned}:${otp}:${expiry}`)
    .digest('hex');

  let valid = false;
  try {
    valid = crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch { valid = false; }

  if (!valid) {
    return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
  }

  return res.status(200).json({ success: true });
}
