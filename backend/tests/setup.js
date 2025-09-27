// Global test setup
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in test output
global.console = {
    ...console,
    // Uncomment the line below to suppress console.log during tests
    // log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
};