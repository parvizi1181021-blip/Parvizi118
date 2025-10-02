// /api/zarinpal/request.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, description, mobile, orderId } = req.body;

  const response = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", // کد پذیرنده زرین‌پال
      amount, // مبلغ به ریال
      callback_url: "https://parsaholdingsiranians.ir/api/zarinpal/verify",
      description: description || "پرداخت درگاه پارسا هلدینگ",
      metadata: { mobile, orderId }
    })
  });

  const data = await response.json();

  if (data.data && data.data.code === 100) {
    // موفق، هدایت به درگاه
    return res.status(200).json({
      url: `https://pay.parsaholdingsiranians.ir/pg/StartPay/${data.data.authority}`
    });
  } else {
    return res.status(400).json({ error: data.errors });
  }
}
