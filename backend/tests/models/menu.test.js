const menu = require('../../models/menu');

describe('Menu Model', () => {
    test('should have correct menu structure', () => {
        expect(menu).toBeDefined();
        expect(typeof menu).toBe('object');
    });

    test('should have all required menu items', () => {
        const expectedItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

        expectedItems.forEach(itemId => {
            expect(menu[itemId]).toBeDefined();
            expect(menu[itemId]).toHaveProperty('name');
            expect(menu[itemId]).toHaveProperty('price');
        });
    });

    test('should have valid item properties', () => {
        Object.keys(menu).forEach(itemId => {
            const item = menu[itemId];

            // Name should be a non-empty string
            expect(typeof item.name).toBe('string');
            expect(item.name.length).toBeGreaterThan(0);

            // Price should be a positive number
            expect(typeof item.price).toBe('number');
            expect(item.price).toBeGreaterThan(0);
        });
    });

    test('should have specific menu items with correct details', () => {
        expect(menu[1]).toEqual({ name: 'Jollof Rice', price: 2500 });
        expect(menu[2]).toEqual({ name: 'Fried Rice', price: 2500 });
        expect(menu[10]).toEqual({ name: 'Bread and Egg', price: 1200 });
        expect(menu[15]).toEqual({ name: 'Ponmo Stew', price: 2200 });
    });

    test('should have exactly 15 menu items', () => {
        const itemCount = Object.keys(menu).length;
        expect(itemCount).toBe(15);
    });

    test('should have reasonable price ranges', () => {
        const prices = Object.values(menu).map(item => item.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Prices should be reasonable (between 1000 and 5000 NGN)
        expect(minPrice).toBeGreaterThanOrEqual(1000);
        expect(maxPrice).toBeLessThanOrEqual(5000);
    });

    test('should not have duplicate item names', () => {
        const names = Object.values(menu).map(item => item.name);
        const uniqueNames = [...new Set(names)];

        expect(names.length).toBe(uniqueNames.length);
    });
});