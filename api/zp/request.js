export const config = { runtime: 'edge' };

export default async function handler(req) {
  if(req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const body = await req.json();
  const amount = Number(body.amount || 0);
  const description = body.description || 'بسته آموزشی';
  if(!amount || amount < 1000) return new Response(JSON.stringify({ error:'Amount required' }), { status:400, headers:{'Content-Type':'application/json'} });

  const merchant = process.env.ZP_MERCHANT_CODE;
  const callbackUrl = `${process.env.BASE_URL}/api/zp/verify`;

  const res = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ merchant_id: merchant, amount, callback_url: callbackUrl, description })
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { headers:{'Content-Type':'application/json'} });
}