/**
 * Vercel Serverless Function — POST /api/create-order
 * Creates a Razorpay order and returns the order_id to the frontend.
 * The Razorpay Key Secret is NEVER exposed to the browser.
 */
export default async function handler(req, res) {
  // CORS headers (allow Vercel preview URLs + production domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const keyId     = process.env.RAZORPAY_KEY_ID     || 'rzp_live_ScXgUdoUvOk0Vj';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'w0C0Y84Qiw0hauP6kFECAWhH';

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount:   Math.round(amount * 100),   // Razorpay needs paise
        currency,
        receipt:  receipt || `vex_${Date.now()}`,
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      const errorMessage = order.error?.description || 'Order creation failed';
      const normalizedMessage = String(errorMessage).toLowerCase();

      if (normalizedMessage.includes('authentication failed')) {
        return res.status(400).json({
          error: 'Razorpay authentication failed. Check matching RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET values in Vercel.',
        });
      }

      return res.status(400).json({ error: errorMessage });
    }

    return res.status(200).json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error('create-order error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
