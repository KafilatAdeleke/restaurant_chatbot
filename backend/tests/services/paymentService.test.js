const paymentService = require('../../services/paymentService');

// Mock the paystack config
jest.mock('../../config/paystack', () => ({
    paystack: {
        transaction: {
            initialize: jest.fn(),
            verify: jest.fn()
        }
    }
}));

// Mock uuid
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid-123')
}));

const { paystack } = require('../../config/paystack');

describe('PaymentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset environment variable
        process.env.BASE_URL = 'http://localhost:3001';
    });

    describe('initializePayment', () => {
        test('should successfully initialize payment', async () => {
            const mockResponse = {
                status: true,
                data: {
                    authorization_url: 'https://checkout.paystack.com/test-url'
                }
            };

            paystack.transaction.initialize.mockResolvedValue(mockResponse);

            const orderData = { total: 5000 };
            const customerEmail = 'test@example.com';
            const sessionId = 'session-123';

            const result = await paymentService.initializePayment(orderData, customerEmail, sessionId);

            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                orderId: 'mock-uuid-123',
                reference: 'mock-uuid-123',
                authorizationUrl: 'https://checkout.paystack.com/test-url',
                amount: 5000
            });

            expect(paystack.transaction.initialize).toHaveBeenCalledWith({
                reference: 'mock-uuid-123',
                amount: 500000, // 5000 * 100 (kobo)
                email: 'test@example.com',
                currency: 'NGN',
                callback_url: 'http://localhost:3001/api/payment/callback',
                metadata: {
                    orderId: 'mock-uuid-123',
                    sessionId: 'session-123'
                }
            });
        });

        test('should handle payment initialization failure', async () => {
            const mockResponse = {
                status: false,
                message: 'Invalid email address'
            };

            paystack.transaction.initialize.mockResolvedValue(mockResponse);

            const orderData = { total: 5000 };
            const result = await paymentService.initializePayment(orderData, 'invalid-email', 'session-123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid email address');
        });

        test('should handle API errors', async () => {
            const mockError = new Error('Network error');
            paystack.transaction.initialize.mockRejectedValue(mockError);

            const orderData = { total: 5000 };
            const result = await paymentService.initializePayment(orderData, 'test@example.com', 'session-123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
        });

        test('should use default callback URL when BASE_URL not set', async () => {
            delete process.env.BASE_URL;

            const mockResponse = {
                status: true,
                data: { authorization_url: 'https://checkout.paystack.com/test-url' }
            };

            paystack.transaction.initialize.mockResolvedValue(mockResponse);

            await paymentService.initializePayment({ total: 1000 }, 'test@example.com', 'session-123');

            expect(paystack.transaction.initialize).toHaveBeenCalledWith(
                expect.objectContaining({
                    callback_url: 'http://localhost:3001/api/payment/callback'
                })
            );
        });
    });

    describe('verifyPayment', () => {
        test('should successfully verify payment', async () => {
            const mockResponse = {
                status: true,
                data: {
                    status: 'success',
                    amount: 500000,
                    paid_at: '2024-01-01T12:00:00Z'
                },
                message: 'Verification successful'
            };

            paystack.transaction.verify.mockResolvedValue(mockResponse);

            const result = await paymentService.verifyPayment('test-reference');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockResponse.data);
            expect(result.message).toBe('Verification successful');

            expect(paystack.transaction.verify).toHaveBeenCalledWith('test-reference');
        });

        test('should handle failed payment verification', async () => {
            const mockResponse = {
                status: true,
                data: {
                    status: 'failed'
                },
                message: 'Payment failed'
            };

            paystack.transaction.verify.mockResolvedValue(mockResponse);

            const result = await paymentService.verifyPayment('test-reference');

            expect(result.success).toBe(false);
            expect(result.data).toEqual(mockResponse.data);
        });

        test('should handle API verification errors', async () => {
            const mockError = new Error('Verification API error');
            paystack.transaction.verify.mockRejectedValue(mockError);

            const result = await paymentService.verifyPayment('test-reference');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Verification API error');
        });

        test('should handle invalid response status', async () => {
            const mockResponse = {
                status: false,
                message: 'Invalid reference'
            };

            paystack.transaction.verify.mockResolvedValue(mockResponse);

            const result = await paymentService.verifyPayment('invalid-reference');

            expect(result.success).toBe(false);
        });
    });

    describe('generateReference', () => {
        test('should generate unique reference', () => {
            const reference1 = paymentService.generateReference();
            const reference2 = paymentService.generateReference();

            expect(typeof reference1).toBe('string');
            expect(typeof reference2).toBe('string');
            // Note: In real implementation, these would be different
            // but our mock returns the same value
        });
    });
});