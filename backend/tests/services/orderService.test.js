const orderService = require('../../services/orderService');

// Mock the menu module
jest.mock('../../models/menu', () => ({
    1: { name: 'Jollof Rice', price: 2500 },
    2: { name: 'Fried Rice', price: 2500 },
    3: { name: 'White Rice and Stew', price: 2000 },
    4: { name: 'Beans and Plantain', price: 1800 }
}));

describe('OrderService', () => {
    describe('calculateTotal', () => {
        test('should calculate correct total for single item', () => {
            const orderItems = { 1: 2 }; // 2x Jollof Rice
            const total = orderService.calculateTotal(orderItems);
            expect(total).toBe(5000); // 2500 * 2
        });

        test('should calculate correct total for multiple items', () => {
            const orderItems = {
                1: 2, // 2x Jollof Rice = 5000
                3: 1, // 1x White Rice = 2000
                4: 3  // 3x Beans = 5400
            };
            const total = orderService.calculateTotal(orderItems);
            expect(total).toBe(12400);
        });

        test('should return 0 for empty order', () => {
            const total = orderService.calculateTotal({});
            expect(total).toBe(0);
        });

        test('should ignore invalid menu items', () => {
            const orderItems = {
                1: 1, // Valid item = 2500
                99: 5 // Invalid item = ignored
            };
            const total = orderService.calculateTotal(orderItems);
            expect(total).toBe(2500);
        });
    });

    describe('createOrder', () => {
        test('should create order with correct structure', () => {
            const items = { 1: 2, 3: 1 };
            const order = orderService.createOrder(items);

            expect(order).toHaveProperty('id');
            expect(order).toHaveProperty('items', items);
            expect(order).toHaveProperty('total', 7000); // 5000 + 2000
            expect(order).toHaveProperty('status', 'pending');
            expect(order).toHaveProperty('timestamp');
            expect(typeof order.id).toBe('string');
            expect(typeof order.timestamp).toBe('number');
        });

        test('should create order with custom status', () => {
            const items = { 1: 1 };
            const order = orderService.createOrder(items, 'paid');
            expect(order.status).toBe('paid');
        });

        test('should create order with additional data', () => {
            const items = { 1: 1 };
            const additionalData = { customerEmail: 'test@example.com' };
            const order = orderService.createOrder(items, 'pending', additionalData);

            expect(order.customerEmail).toBe('test@example.com');
        });
    });

    describe('createScheduledOrder', () => {
        test('should create scheduled order with correct timestamp', () => {
            const items = { 1: 1 };
            const scheduledTime = new Date('2024-12-25T14:30:00');
            const order = orderService.createScheduledOrder(items, scheduledTime);

            expect(order.status).toBe('scheduled');
            expect(order.scheduledTime).toBe(scheduledTime.getTime());
        });
    });

    describe('formatOrderSummary', () => {
        test('should format order summary correctly', () => {
            const orderItems = { 1: 2, 3: 1 };
            const { summary, total } = orderService.formatOrderSummary(orderItems);

            expect(summary).toContain('🛒 ORDER SUMMARY');
            expect(summary).toContain('Jollof Rice (x2) - NGN5000');
            expect(summary).toContain('White Rice and Stew (x1) - NGN2000');
            expect(summary).toContain('💰 TOTAL: NGN7000');
            expect(total).toBe(7000);
        });

        test('should handle empty order', () => {
            const { summary, total } = orderService.formatOrderSummary({});
            expect(summary).toContain('🛒 ORDER SUMMARY');
            expect(summary).toContain('💰 TOTAL: NGN0');
            expect(total).toBe(0);
        });
    });

    describe('formatCurrentOrder', () => {
        test('should format current order correctly', () => {
            const orderItems = { 1: 1, 4: 2 };
            const formatted = orderService.formatCurrentOrder(orderItems);

            expect(formatted).toContain('🛒 Your current order:');
            expect(formatted).toContain('• Jollof Rice (x1) - NGN2500');
            expect(formatted).toContain('• Beans and Plantain (x2) - NGN3600');
            expect(formatted).toContain('💰 Total: NGN6100');
        });
    });

    describe('formatOrderHistory', () => {
        test('should format order history correctly', () => {
            const orderHistory = [
                {
                    id: 'order-1',
                    status: 'paid',
                    timestamp: new Date('2024-01-01').getTime(),
                    items: { 1: 1 },
                    total: 2500
                },
                {
                    id: 'order-2',
                    status: 'completed',
                    timestamp: new Date('2024-01-02').getTime(),
                    items: { 2: 2 },
                    total: 5000
                }
            ];

            const formatted = orderService.formatOrderHistory(orderHistory);

            expect(formatted).toContain('📋 Your order history:');
            expect(formatted).toContain('🧾 Order #1 (ID: order-1)');
            expect(formatted).toContain('Status: paid');
            expect(formatted).toContain('🧾 Order #2 (ID: order-2)');
            expect(formatted).toContain('Status: completed');
        });
    });

    describe('addItemToOrder', () => {
        test('should add new item to empty order', () => {
            const currentOrder = {};
            const result = orderService.addItemToOrder(currentOrder, 1);

            expect(result.success).toBe(true);
            expect(result.message).toContain('Jollof Rice has been added');
            expect(result.message).toContain('Current quantity: 1');
            expect(result.updatedOrder[1]).toBe(1);
        });

        test('should increment existing item quantity', () => {
            const currentOrder = { 1: 2 };
            const result = orderService.addItemToOrder(currentOrder, 1);

            expect(result.success).toBe(true);
            expect(result.message).toContain('Current quantity: 3');
            expect(result.updatedOrder[1]).toBe(3);
        });

        test('should reject invalid menu item', () => {
            const currentOrder = {};
            const result = orderService.addItemToOrder(currentOrder, 99);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid menu item');
        });

        test('should include next steps in message', () => {
            const currentOrder = {};
            const result = orderService.addItemToOrder(currentOrder, 1);

            expect(result.message).toContain('📋 What\'s next?');
            expect(result.message).toContain('1️⃣ See menu');
            expect(result.message).toContain('9️⃣9️⃣ Checkout');
        });
    });
});