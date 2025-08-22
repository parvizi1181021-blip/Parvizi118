export const config = { runtime: 'edge' };

const html = (ok, trackId, orderId, message) => `<!doctype html>
<html lang="fa" dir="rtl"><meta charset="utf-8">
<title>نتیجه پرداخت</title>
<style>
body{font-family:Tahoma,Arial;display:grid;place-items:center;height:100vh;background:#0b1220;color:#e2e8f0}
.card{max-width:560px;background:#0f172a;border:1px solid #334155;border-radius:14px;padding:20px}
.badge{display:inline-block;padding:6px 10px;border-radius:999px;background:${ok?'#16a34a':'#ef4444'};color:#041019;font-weight:700}
a.btn{display:inline-block;margin-top:14px;padding:10px 14px;border-radius:12px;background:#22c55e;color:#041019;text-decoration:none}
</style>
<div class="card">
  <span class="badge">${ok? 'موفق' : 'ناموفق'}</span>
  <h1>نتیجه پرداخت</h1>
  <p>${message ?? ''}</p>
  <p>شماره پیگیری: <b>${trackId ?? '-'}</b></p>
  <p>کد سفارش: <b>${orderId ?? '-'}</b></p>
  <a class="btn" href="/">بازگشت به سایت</a>
</div></html>`;

export default async function handler(req) {
  const url = new URL(req.url);
  const trackId = url.searchParams.get('trackId');
  if (!trackId) return new Response(html(false, null, null, 'trackId یافت نشد'), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

  const merchant = process.env.ZIBAL_MERCHANT;
  if (!merchant) return new Response(html(false, null, null, 'merchant تنظیم نشده'), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

  const res = await fetch('https://gateway.zibal.ir/v1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant, trackId })
  });
  const data = await res.json();
  const ok = data?.result === 100; // 100 = موفق
  return new Response(html(ok, String(trackId), data?.orderId ? String(data.orderId) : '', data?.message), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 200
  });
}