export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount } = req.body;

  try {
    const response = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: "7b9a76db-61b3-4079-84f9-b79aaa7f261d", // 👈 Merchant ID خودت
        amount: amount,
        description: "خرید شن و ماسه از پارسا هلدینگ ایرانیان",
        callback_url: "https://parsaholdingsiranians.ir/api/zarinpal/verify"
      })
    });

    const data = await response.json();
    if (data.data && data.data.code === 100) {
      return res.status(200).json({ url: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}` });
    } else {
      return res.status(400).json({ error: data.errors });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}