/**
 * Vercel Serverless Function — POST /api/verify-payment
 * Verifies Razorpay payment signature using HMAC-SHA256.
 * This MUST run on the server — never verify on the client side.
 */
import { createHmac } from 'crypto';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing payment fields' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return res.status(500).json({ success: false, error: 'Payment gateway not configured on server.' });
  }

  const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  if (expected === razorpay_signature) {
    return res.status(200).json({ success: true, paymentId: razorpay_payment_id });
  } else {
    return res.status(400).json({ success: false, error: 'Signature mismatch — payment not verified' });
  }
}
