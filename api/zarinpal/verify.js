export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { Authority, Status, amount } = req.query;
  if (!Authority || !Status) return res.status(400).send("اطلاعات بازگشتی نامعتبر است.");

  if (Status !== "OK") {
    return res.status(400).send("پرداخت توسط کاربر لغو شد.");
  }

  try {
    const response = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", // 👈 Merchant ID
        amount: amount || 1000, // اینو می‌تونی دقیق‌تر مدیریت کنی
        authority: Authority
      })
    });

    const data = await response.json();
    if (data.data && data.data.code === 100) {
      return res.status(200).send(`
        <html lang="fa"><head><meta charset="utf-8"></head>
        <body style="text-align:center; font-family:tahoma">
          <h2 style="color:green;">✅ پرداخت موفق بود</h2>
          <p>کد پیگیری: <b>${data.data.ref_id}</b></p>
        </body></html>
      `);
    } else {
      return res.status(400).send("پرداخت ناموفق");
    }
  } catch (err) {
    return res.status(500).send("خطای سرور: " + err.message);
  }
}
