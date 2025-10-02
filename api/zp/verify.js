export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { Authority, Status } = req.query;

  // اگر کاربر تراکنش رو لغو کرده باشه
  if (Status !== "OK") {
    return res.status(200).send("<h2>❌ پرداخت توسط کاربر لغو شد.</h2>");
  }

  // ارسال به زرین‌پال برای بررسی
  const response = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: process.env.ZP_MERCHANT,
      authority: Authority,
      amount: 100000 // مبلغ باید دقیقا همونی باشه که تو Request بود
    })
  });

  const result = await response.json();

  if (result.data && result.data.code === 100) {
    // ✅ پرداخت موفق
    return res.status(200).send(`
      <h2>✅ پرداخت موفق بود</h2>
      <p>کد پیگیری: <b>${result.data.ref_id}</b></p>
    `);
  } else if (result.data && result.data.code === 101) {
    // تراکنش قبلاً تایید شده
    return res.status(200).send("<h2>ℹ️ این تراکنش قبلاً تایید شده است.</h2>");
  } else {
    // ❌ خطا در پرداخت
    return res.status(400).send("<h2>❌ پرداخت ناموفق بود.</h2>");
  }
}
