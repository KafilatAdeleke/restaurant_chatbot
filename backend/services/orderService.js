const { v4: uuidv4 } = require('uuid');
const menu = require('../models/menu');

class OrderService {
    /**
     * Calculate total for an order
     * @param {Object} orderItems - Order items with quantities
     * @returns {number} Total amount
     */
    calculateTotal(orderItems) {
        let total = 0;
        for (const itemId in orderItems) {
            const quantity = orderItems[itemId];
            const item = menu[itemId];
            if (item) {
                total += item.price * quantity;
            }
        }
        return total;
    }

    /**
     * Create an order object
     * @param {Object} items - Order items
     * @param {string} status - Order status
     * @param {Object} additionalData - Additional order data
     * @returns {Object} Order object
     */
    createOrder(items, status = 'pending', additionalData = {}) {
        const total = this.calculateTotal(items);

        return {
            id: uuidv4(),
            items: { ...items },
            total: total,
            status: status,
            timestamp: Date.now(),
            ...additionalData
        };
    }

    /**
     * Create a scheduled order
     * @param {Object} items - Order items
     * @param {Date} scheduledTime - When the order is scheduled for
     * @returns {Object} Scheduled order object
     */
    createScheduledOrder(items, scheduledTime) {
        return this.createOrder(items, 'scheduled', {
            scheduledTime: scheduledTime.getTime()
        });
    }

    /**
     * Format order summary for display
     * @param {Object} orderItems - Order items with quantities
     * @returns {string} Formatted order summary
     */
    formatOrderSummary(orderItems) {
        let summary = '🛒 ORDER SUMMARY\n\n';
        let total = 0;

        for (const itemId in orderItems) {
            const quantity = orderItems[itemId];
            const item = menu[itemId];
            if (item) {
                const itemTotal = item.price * quantity;
                summary += `${item.name} (x${quantity}) - NGN${itemTotal}\n`;
                total += itemTotal;
            }
        }

        summary += `\n💰 TOTAL: NGN${total}\n\n`;
        return { summary, total };
    }

    /**
     * Format current order for display
     * @param {Object} orderItems - Order items with quantities
     * @returns {string} Formatted current order
     */
    formatCurrentOrder(orderItems) {
        let response = '🛒 Your current order:\n\n';
        let total = 0;

        for (const itemId in orderItems) {
            const quantity = orderItems[itemId];
            const item = menu[itemId];
            if (item) {
                response += `• ${item.name} (x${quantity}) - NGN${item.price * quantity}\n`;
                total += item.price * quantity;
            }
        }

        response += `\n💰 Total: NGN${total}`;
        return response;
    }

    /**
     * Format order history for display
     * @param {Array} orderHistory - Array of past orders
     * @returns {string} Formatted order history
     */
    formatOrderHistory(orderHistory) {
        let response = '📋 Your order history:\n\n';

        orderHistory.forEach((order, index) => {
            response += `🧾 Order #${index + 1} (ID: ${order.id}):\n`;
            response += `   Status: ${order.status}\n`;
            response += `   Date: ${new Date(order.timestamp).toLocaleString()}\n`;
            response += '   Items:\n';

            for (const itemId in order.items) {
                const quantity = order.items[itemId];
                const item = menu[itemId];
                if (item) {
                    response += `   • ${item.name} (x${quantity}) - NGN${item.price * quantity}\n`;
                }
            }
            response += `   💰 Total: NGN${order.total}\n\n`;
        });

        return response;
    }

    /**
     * Add item to order
     * @param {Object} currentOrder - Current order items
     * @param {number} itemId - Menu item ID
     * @returns {Object} Updated order and response message
     */
    addItemToOrder(currentOrder, itemId) {
        const item = menu[itemId];
        if (!item) {
            return {
                success: false,
                message: 'Invalid menu item'
            };
        }

        if (currentOrder[itemId]) {
            currentOrder[itemId]++;
        } else {
            currentOrder[itemId] = 1;
        }

        const response = `✅ ${item.name} has been added to your order. Current quantity: ${currentOrder[itemId]}`;
        const nextSteps = `\n\n📋 What's next?\n1️⃣ See menu\n9️⃣9️⃣ Checkout\n9️⃣7️⃣ See current order\n1️⃣0️⃣2️⃣ Schedule order`;

        return {
            success: true,
            message: response + nextSteps,
            updatedOrder: currentOrder
        };
    }
}

module.exports = new OrderService();