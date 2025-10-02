const res = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({
    merchant_id: ZP_MERCHANT,
    amount: 100000,
    callback_url: 'https://pay.parsaholdingsiranians.ir/success',
    description: 'بسته آموزشی'
  })
});
const data = await res.json();
const authority = data.data.authority; // حتماً این 36 کاراکتری است