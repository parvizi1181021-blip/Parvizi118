const verifyRes = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({
    merchant_id: ZP_MERCHANT,
    authority: authority, // همین Authority دریافتی
    amount: 100000
  })
});