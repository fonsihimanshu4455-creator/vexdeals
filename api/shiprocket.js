/**
 * Vercel Serverless Function — POST /api/shiprocket
 * Creates a shipment order in Shiprocket. Credentials stay server-side.
 *
 * Required Vercel env vars:
 *   SHIPROCKET_EMAIL     — your Shiprocket account email (or API user email)
 *   SHIPROCKET_PASSWORD  — that account's password
 *   SHIPROCKET_PICKUP    — (optional) registered pickup location nickname (default "Primary")
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  const pickup   = process.env.SHIPROCKET_PICKUP || 'Primary';

  if (!email || !password) {
    return res.status(500).json({
      error: 'Shiprocket not configured. Add SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in Vercel → Settings → Environment Variables.',
    });
  }

  const order = req.body?.order;
  if (!order) return res.status(400).json({ error: 'Missing order data.' });

  try {
    // 1) Authenticate → token
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const authData = await authRes.json();
    if (!authData?.token) {
      return res.status(400).json({ error: authData?.message || 'Shiprocket login failed. Check email/password.' });
    }
    const token = authData.token;

    // 2) Map our order → Shiprocket payload
    const addr = order.shippingAddress || {};
    const fullName = String(order.userName || addr.fullName || 'Customer').trim();
    const [firstName, ...restName] = fullName.split(' ');
    const items = (order.products || order.items || []).map((it) => ({
      name: String(it.name || 'Item'),
      sku: String(it.id || it.sku || it.name || 'sku'),
      units: Number(it.qty || 1),
      selling_price: Number(it.price || 0),
    }));
    const addressLine = typeof order.address === 'string' ? order.address : (addr.address || order.address?.line || '—');

    const payload = {
      order_id: String(order.id || `vex_${Date.now()}`),
      order_date: new Date().toISOString().slice(0, 10),
      pickup_location: pickup,
      billing_customer_name: firstName || fullName,
      billing_last_name: restName.join(' ') || '',
      billing_address: addressLine,
      billing_city: addr.city || order.city || '',
      billing_pincode: String(addr.pincode || order.pincode || ''),
      billing_state: addr.state || order.state || '',
      billing_country: 'India',
      billing_email: order.userEmail || addr.email || '',
      billing_phone: String(order.phone || addr.phone || ''),
      shipping_is_billing: true,
      order_items: items.length ? items : [{ name: 'Order', sku: 'order', units: 1, selling_price: Number(order.total || 0) }],
      payment_method: /cod|cash/i.test(order.paymentMethod || order.payment?.method || '') ? 'COD' : 'Prepaid',
      sub_total: Number(order.subtotal || order.total || 0),
      length: 15, breadth: 12, height: 6, weight: 0.5,
    };

    // 3) Create order in Shiprocket
    const createRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await createRes.json();

    if (!createRes.ok || data?.status_code === 422 || (data?.errors && Object.keys(data.errors).length)) {
      const msg = data?.message || (data?.errors && JSON.stringify(data.errors)) || 'Shiprocket order creation failed.';
      return res.status(400).json({ error: msg });
    }

    return res.status(200).json({
      ok: true,
      orderId: data.order_id,
      shipmentId: data.shipment_id,
      status: data.status,
      raw: data,
    });
  } catch (err) {
    console.error('shiprocket error:', err);
    return res.status(500).json({ error: 'Internal server error contacting Shiprocket.' });
  }
}
