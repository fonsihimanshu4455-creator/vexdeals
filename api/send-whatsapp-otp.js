/**
 * Vercel Serverless Function — POST /api/send-whatsapp-otp
 * Sends a mobile OTP via MSG91's OTP platform. MSG91 generates, sends AND
 * stores the OTP server-side; /api/verify-whatsapp-otp checks it against MSG91.
 * (No self-generated OTP — that caused a mismatch with what MSG91 sent.)
 *
 * Required env (Vercel): MSG91_AUTH_KEY, MSG91_TEMPLATE_ID
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const cleaned = String(req.body?.phone || '').replace(/\D/g, '').slice(-10);
  if (cleaned.length !== 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
  }

  const AUTH = process.env.MSG91_AUTH_KEY;
  const TEMPLATE = process.env.MSG91_TEMPLATE_ID;

  // Dev mode — no keys configured. OTP can't be sent; verify will accept any
  // code so the flow is still testable locally.
  if (!AUTH || !TEMPLATE) {
    console.log(`[VexDeals OTP dev] +91${cleaned} — MSG91 keys not set; verify will accept any code.`);
    return res.status(200).json({ success: true, dev: true });
  }

  try {
    const url = `https://control.msg91.com/api/v5/otp?otp_expiry=5&template_id=${encodeURIComponent(TEMPLATE)}&mobile=91${cleaned}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { authkey: AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await resp.json();
    if (data?.type === 'success') return res.status(200).json({ success: true });
    console.error('MSG91 send error:', data);
    return res.status(500).json({ error: data?.message || 'Could not send OTP. Check MSG91 template / KYC.' });
  } catch (err) {
    console.error('MSG91 send fetch error:', err);
    return res.status(500).json({ error: 'Could not reach the SMS service. Please try again.' });
  }
}
