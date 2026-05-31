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

  const { phone } = req.body || {};
  const cleaned = String(phone || '').replace(/\D/g, '').slice(-10);

  if (cleaned.length !== 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
  }

  const otp    = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Stateless HMAC token — no DB needed
  const payload = `${cleaned}:${otp}:${expiry}`;
  const sig     = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');
  const token   = `${expiry}.${sig}`;

  const MSG91_AUTH_KEY    = process.env.MSG91_AUTH_KEY;
  const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

  if (MSG91_AUTH_KEY && MSG91_TEMPLATE_ID) {
    try {
      const resp = await fetch('https://api.msg91.com/api/v5/otp', {
        method:  'POST',
        headers: { authkey: MSG91_AUTH_KEY, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ template_id: MSG91_TEMPLATE_ID, mobile: `91${cleaned}`, otp }),
      });
      const data = await resp.json();
      if (data.type !== 'success') {
        console.error('MSG91 error:', data);
        return res.status(500).json({ error: 'Failed to send OTP via WhatsApp. Please try again.' });
      }
    } catch (err) {
      console.error('MSG91 fetch error:', err);
      return res.status(500).json({ error: 'Could not reach WhatsApp service.' });
    }
  } else {
    // Dev mode — OTP visible in Vercel function logs
    console.log(`[VexDeals OTP] +91${cleaned} → ${otp}  (5 min expiry)`);
  }

  return res.status(200).json({ success: true, token });
}
