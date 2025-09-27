const { v4: uuidv4 } = require('uuid');
const { paystack } = require('../config/paystack');

class PaymentService {
    /**
     * Initialize a payment with Paystack
     * @param {Object} orderData - Order information
     * @param {string} customerEmail - Customer email address
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object>} Payment initialization result
     */
    async initializePayment(orderData, customerEmail, sessionId) {
        try {
            const reference = uuidv4();
            const orderId = uuidv4();

            const paystackData = {
                reference: reference,
                amount: orderData.total * 100, // Paystack expects amount in kobo
                email: customerEmail,
                currency: 'NGN',
                callback_url: `${process.env.BASE_URL || 'http://localhost:3001'}/api/payment/callback`,
                metadata: {
                    orderId: orderId,
                    sessionId: sessionId
                }
            };

            const response = await paystack.transaction.initialize(paystackData);

            if (response.status) {
                console.log(`Payment initialized successfully for order ${orderId}, reference: ${reference}, amount: ${orderData.total}, email: ${customerEmail}`);

                return {
                    success: true,
                    data: {
                        orderId,
                        reference,
                        authorizationUrl: response.data.authorization_url,
                        amount: orderData.total
                    }
                };
            } else {
                console.error(`Payment initialization failed for order ${orderId}, reason: ${response.message || 'Unknown error'}`);
                return {
                    success: false,
                    error: response.message || 'Unknown error'
                };
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: error.message || 'An unexpected error occurred'
            };
        }
    }

    /**
     * Verify payment with Paystack
     * @param {string} reference - Payment reference
     * @returns {Promise<Object>} Payment verification result
     */
    async verifyPayment(reference) {
        try {
            const response = await paystack.transaction.verify(reference);
            console.log(`Payment verification response for reference ${reference}:`, response);

            return {
                success: response.status && response.data.status === 'success',
                data: response.data,
                message: response.message
            };
        } catch (error) {
            console.error('Payment verification error for reference:', reference, error);
            return {
                success: false,
                error: error.message || 'Verification failed'
            };
        }
    }

    /**
     * Generate a unique payment reference
     * @returns {string} Unique reference
     */
    generateReference() {
        return uuidv4();
    }
}

module.exports = new PaymentService();