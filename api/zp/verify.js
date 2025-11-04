export const config = { runtime: 'edge' };
const brandSVG = `<svg width="48" height="48" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" aria-label="لوگو"><g fill="none"><circle cx="64" cy="64" r="60" fill="#16a34a"/><g transform="translate(20 20)"><path d="M44 64c14-6 24-18 26-34c-14 2-26 12-30 26c-2 6-2 8-2 8z" fill="#041019" opacity=".25"/><path d="M28 68c18 0 32-14 32-32C41 38 28 50 28 68z" fill="#e2e8f0"/><path d="M44 14l6 2l4-4l6 2l2 6l6 2v6l-6 2l-2 6l-6 2l-4-4l-6 2l-4-6l-6-2v-6l6-2l4-6z" fill="#041019" opacity=".5"/></g></g></svg>`;
const html = (ok, ref, authority, msg) => `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>نتیجه پرداخت</title><style>body{font-family:Tahoma,Arial;display:grid;place-items:center;height:100vh;background:#0b1220;color:#e2e8f0;margin:0}.card{max-width:560px;background:#0f172a;border:1px solid #334155;border-radius:14px;padding:20px;text-align:center}.badge{display:inline-block;padding:6px 10px;border-radius:999px;background:${ok?'#16a34a':'#ef4444'};color:#041019;font-weight:700}a.btn{display:inline-block;margin-top:14px;padding:10px 14px;border-radius:12px;background:#22c55e;color:#041019;text-decoration:none}.logo{display:grid;place-items:center;margin-bottom:10px}</style><div class='card'><div class='logo'>${brandSVG}</div><span class='badge'>${ok?'موفق':'ناموفق'}</span><h1>نتیجه پرداخت</h1><p>${msg ?? ''}</p><p>شماره پیگیری: <b>${ref ?? '-'}</b></p><p>authority: <b>${authority ?? '-'}</b></p><a class='btn' href='/'>بازگشت به سایت</a></div></html>`;
export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const Authority = url.searchParams.get('Authority') || url.searchParams.get('authority');
    const Status = url.searchParams.get('Status') || url.searchParams.get('status');
    const amount = Number(url.searchParams.get('amount') || 0); // ریال از callback

    if (!Authority) return new Response(html(false,null,null,'پارامتر Authority یافت نشد'), { headers:{ 'Content-Type':'text/html; charset=utf-8' }});

    if (String(Status).toUpperCase() !== 'OK') {
      return new Response(html(false,null,Authority,'تراکنش توسط کاربر لغو شد یا نامعتبر است.'), { headers:{ 'Content-Type':'text/html; charset=utf-8' }});
    }

    const merchant = process.env.ZARINPAL_MERCHANT;
    if (!merchant) return new Response(html(false,null,Authority,'merchant تنظیم نشده'), { headers:{ 'Content-Type':'text/html; charset=utf-8' }});

    if (!amount) return new Response(html(false,null,Authority,'amount در callback وجود ندارد'), { headers:{ 'Content-Type':'text/html; charset=utf-8' }});

    const res = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ merchant_id: merchant, amount, authority: Authority })
    });
    const data = await res.json();
    const ok = data?.data?.code === 100 || data?.data?.code === 101;
    const ref = data?.data?.ref_id || null;
    const msg = data?.data?.message || data?.errors?.message || '';

    return new Response(html(ok, ref, Authority, msg), { headers:{ 'Content-Type':'text/html; charset=utf-8' }});
  } catch (err) {
    return new Response(html(false,null,null,String(err?.message || err)), { headers:{ 'Content-Type':'text/html; charset=utf-8' }, status:500});
  }
}