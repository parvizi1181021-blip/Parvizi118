export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const body = await req.json();
  const amount = Number(body.amount || 0); // ریال
  const mobile = body.mobile || '';
  const description = body.description || '';
  const orderId = body.orderId || '';

  if (!amount || amount < 1000) {
    return new Response(JSON.stringify({ result: -1, message: 'amount (rial) required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const merchant = process.env.ZIBAL_MERCHANT;
  if (!merchant) {
    return new Response(JSON.stringify({ result: -1, message: 'Missing ZIBAL_MERCHANT' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  const callbackUrl = `${base}/api/zibal/verify`;

  const res = await fetch('https://gateway.zibal.ir/v1/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant, amount, callbackUrl, orderId, description, mobile })
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.ok ? 200 : 500, headers: { 'Content-Type': 'application/json' }
  });
}