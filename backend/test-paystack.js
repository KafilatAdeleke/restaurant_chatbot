// Simple test script to verify Paystack integration
require('dotenv').config();
const paymentService = require('./services/paymentService');

async function testPaystack() {
    console.log('🧪 Testing Paystack Integration...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Paystack Secret Key:', process.env.PAYSTACK_SECRET_KEY ? 'Set ✅' : 'Missing ❌');

    try {
        // Test payment initialization
        const testOrder = { total: 2500 }; // NGN 25.00
        const testEmail = 'test@example.com';
        const testSession = 'test-session-123';

        console.log('\n📤 Testing payment initialization...');
        const result = await paymentService.initializePayment(testOrder, testEmail, testSession);

        if (result.success) {
            console.log('✅ Payment initialization successful!');
            console.log('Order ID:', result.data.orderId);
            console.log('Reference:', result.data.reference);
            console.log('Payment URL:', result.data.authorizationUrl);
            console.log('Amount:', `NGN${result.data.amount}`);
        } else {
            console.log('❌ Payment initialization failed:', result.error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testPaystack();