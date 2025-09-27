require('dotenv').config();

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
    console.error('ERROR: Paystack secret key is not configured. Please set PAYSTACK_SECRET_KEY in your .env file.');
    process.exit(1);
}

const paystack = require('paystack')(PAYSTACK_SECRET_KEY);

module.exports = {
    paystack,
    PAYSTACK_SECRET_KEY
};