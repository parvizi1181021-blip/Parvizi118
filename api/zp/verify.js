export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const authority = url.searchParams.get('Authority');
  if(!authority) return new Response('Authority not found', { status: 400 });

  const merchant = process.env.ZP_MERCHANT_CODE;

  const res = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ merchant_id: merchant, authority, amount: 100000 })
  });

  const data = await res.json();
  const ok = data?.data?.code === 100;
  return new Response(`<h1>${ok?'پرداخت موفق':'پرداخت ناموفق'}</h1>
<p>Authority: ${authority}</p>
<p>RefID: ${data?.data?.ref_id ?? '-'}</p>
<a href="/">بازگشت به سایت</a>`, { headers:{'Content-Type':'text/html'} });
}