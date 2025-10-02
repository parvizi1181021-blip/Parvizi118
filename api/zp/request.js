export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, description } = req.body;

  const response = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: process.env.ZP_MERCHANT, // مرچنت واقعی شما
      amount: amount,
      description: description,
      callback_url: "https://YOURDOMAIN.com/api/zp/verify"
    })
  });

  const result = await response.json();

  if(result.data && result.data.authority){
    res.status(200).json({
      url: `https://www.zarinpal.com/pg/StartPay/${result.data.authority}`
    });
  } else {
    res.status(400).json({ error: result.errors });
  }
}
