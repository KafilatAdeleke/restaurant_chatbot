const { v4: uuidv4 } = require('uuid');

class MockPaymentService {
    /**
     * Mock payment initialization - always succeeds for development
     * @param {Object} orderData - Order information
     * @param {string} customerEmail - Customer email address
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object>} Mock payment initialization result
     */
    async initializePayment(orderData, customerEmail, sessionId) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const reference = uuidv4();
        const orderId = uuidv4();

        // Mock successful response
        console.log(`[MOCK] Payment initialized successfully for order ${orderId}, reference: ${reference}, amount: ${orderData.total}, email: ${customerEmail}`);

        return {
            success: true,
            data: {
                orderId,
                reference,
                authorizationUrl: `https://mock-checkout.paystack.com/${reference}`,
                amount: orderData.total
            }
        };
    }

    /**
     * Mock payment verification - always succeeds for development
     * @param {string} reference - Payment reference
     * @returns {Promise<Object>} Mock payment verification result
     */
    async verifyPayment(reference) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log(`[MOCK] Payment verification successful for reference ${reference}`);

        return {
            success: true,
            data: {
                status: 'success',
                amount: 250000, // Mock amount in kobo
                paid_at: new Date().toISOString(),
                reference: reference,
                gateway_response: 'Successful',
                channel: 'card'
            },
            message: 'Verification successful'
        };
    }

    /**
     * Generate a unique payment reference
     * @returns {string} Unique reference
     */
    generateReference() {
        return uuidv4();
    }

    /**
     * Mock method to simulate payment failure (for testing)
     * @param {Object} orderData - Order information
     * @param {string} customerEmail - Customer email address
     * @param {string} sessionId - Session identifier
     * @returns {Promise<Object>} Mock payment failure result
     */
    async initializeFailedPayment(orderData, customerEmail, sessionId) {
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log(`[MOCK] Payment initialization failed for email: ${customerEmail}`);

        return {
            success: false,
            error: 'Mock payment failure - Invalid email format'
        };
    }
}

module.exports = new MockPaymentService();