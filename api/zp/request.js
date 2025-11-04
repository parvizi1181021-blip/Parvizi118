export const config = { runtime: 'edge' };
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  try {
    const body = await req.json();
    const amount = Number(body.amount || 0); // **ریال**
    const description = body.description || '';
    const orderId = body.orderId || '';
    if (!amount || amount < 1000) {
      return new Response(JSON.stringify({ error: 'amount (rial) required' }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }

    const merchant = process.env.ZARINPAL_MERCHANT;
    if (!merchant) {
      return new Response(JSON.stringify({ error: 'Missing ZARINPAL_MERCHANT' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
    // ارسال amount در callback برای verify
    const callbackUrl = `${base}/api/zarinpal/verify?amount=${amount}`;

    const res = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        merchant_id: merchant,
        amount: amount,
        callback_url: callbackUrl,
        description,
        metadata: { orderId }
      })
    });

    const data = await res.json();
    // data.data.authority
    if (data?.data?.code === 100) {
      // اگر زیر دامنه اختصاصی فعال باشه، در پنل زرین‌پال لینک اختصاصی برمی‌گرده
      // ولی برای اطمینان ما لینک را به pay.domain (در صورت فعال بودن) یا آدرس عمومی می‌سازیم:
      const payDomain = process.env.NEXT_PUBLIC_ZARINPAL_PAY_DOMAIN || ''; // مثلا "https://pay.parsaholdingsiranians.ir"
      const authority = data.data.authority;
      const url = payDomain ? `${payDomain}/pg/StartPay/${authority}` : `https://www.zarinpal.com/pg/StartPay/${authority}`;
      return new Response(JSON.stringify({ url, authority, data: data.data }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } else {
      return new Response(JSON.stringify({ error: data.errors || data }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}