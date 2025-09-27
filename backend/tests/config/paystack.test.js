// Mock environment variables before requiring the module
const originalEnv = process.env;

describe('Paystack Config', () => {
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('should export paystack instance when secret key is provided', () => {
        process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_key';

        // Mock the paystack module
        jest.doMock('paystack', () => {
            return jest.fn(() => ({
                transaction: {
                    initialize: jest.fn(),
                    verify: jest.fn()
                }
            }));
        });

        const config = require('../../config/paystack');

        expect(config.paystack).toBeDefined();
        expect(config.PAYSTACK_SECRET_KEY).toBe('sk_test_mock_key');
    });

    test('should exit process when secret key is not provided', () => {
        delete process.env.PAYSTACK_SECRET_KEY;

        // Mock process.exit to prevent actual exit during test
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

        try {
            require('../../config/paystack');
        } catch (error) {
            // Expected to throw or exit
        }

        expect(mockConsoleError).toHaveBeenCalledWith(
            'ERROR: Paystack secret key is not configured. Please set PAYSTACK_SECRET_KEY in your .env file.'
        );
        expect(mockExit).toHaveBeenCalledWith(1);

        mockExit.mockRestore();
        mockConsoleError.mockRestore();
    });

    test('should handle empty secret key', () => {
        process.env.PAYSTACK_SECRET_KEY = '';

        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

        try {
            require('../../config/paystack');
        } catch (error) {
            // Expected to throw or exit
        }

        expect(mockConsoleError).toHaveBeenCalled();
        expect(mockExit).toHaveBeenCalledWith(1);

        mockExit.mockRestore();
        mockConsoleError.mockRestore();
    });
});