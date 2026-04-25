const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

const createOrder = async (amount, currency = 'INR', receipt) => {
  const razorpay = getRazorpay();
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    payment_capture: 1,
  });
};

const verifySignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};

const fetchPayment = async (paymentId) => {
  return getRazorpay().payments.fetch(paymentId);
};

const refundPayment = async (paymentId, amount) => {
  return getRazorpay().payments.refund(paymentId, { amount: Math.round(amount * 100) });
};

module.exports = { createOrder, verifySignature, fetchPayment, refundPayment };
