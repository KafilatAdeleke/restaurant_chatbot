
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import services and utilities
const menu = require('./models/menu');
const { isValidInput, isValidEmail } = require('./utils/validation');
const orderService = require('./services/orderService');

// Use mock payment service
const isDevelopment = process.env.NODE_ENV !== 'production';
const paymentService = isDevelopment
    ? require('./services/mockPaymentService')
    : require('./services/paymentService');

if (isDevelopment) {
    console.log('🚧 Running in DEVELOPMENT mode - using MOCK payment service');
} else {
    console.log('🚀 Running in PRODUCTION mode - using REAL Paystack API');
    // Only require paystack config in production
    const { paystack } = require('./config/paystack');
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static('../frontend'));

// Mock data storage (in production, use a proper database)
const sessions = {};
const orders = {};

// Initialize session if not exists
function initializeSession(sessionId) {
    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            currentOrder: {},
            orderHistory: [],
            scheduledOrders: [],
            state: 'main' // Track user state: 'main', 'ordering', 'scheduling'
        };
    }
}





// Main chatbot logic
async function processChatMessage(message, sessionId) {
    initializeSession(sessionId);
    const session = sessions[sessionId];
    let response = '';

    // Check if user is in email collection state first (before validation)
    if (session.state === 'collecting_email') {
        if (isValidEmail(message)) {
            const customerEmail = message.trim();
            const total = orderService.calculateTotal(session.currentOrder);

            // Create order for payment
            const order = orderService.createOrder(session.currentOrder, 'pending', {
                customerEmail: customerEmail
            });

            // Store the pending order temporarily
            if (!session.pendingOrders) {
                session.pendingOrders = {};
            }

            // Initialize payment
            const paymentResult = await paymentService.initializePayment(
                { total: total },
                customerEmail,
                sessionId
            );

            if (paymentResult.success) {
                // Store order with payment reference
                order.reference = paymentResult.data.reference;
                session.pendingOrders[paymentResult.data.reference] = order;

                response = `💳 PAYMENT READY\n\n`;
                response += `Order ID: ${paymentResult.data.orderId}\n`;
                response += `Amount: NGN${paymentResult.data.amount}\n\n`;
                response += `🔗 Payment Link: ${paymentResult.data.authorizationUrl}\n\n`;
                response += `📱 Click the link above to complete your payment securely with Paystack.\n\n`;
                response += `📧 Receipt will be sent to: ${customerEmail}\n\n`;
                response += `⚠️ Note: This is a test transaction. Use test card: 4084084084084081`;
                session.state = 'main';
            } else {
                response = `❌ Payment initialization failed. Reason: ${paymentResult.error}. Please try again.`;
                session.state = 'main';
            }
            return response;
        } else {
            // Invalid email format
            return `❌ Invalid email format. Please enter a valid email address:\nExample: john.doe@example.com`;
        }
    }

    // Validate input for numeric commands (after email collection check)
    if (!isValidInput(message)) {
        return "Invalid input. Please enter a number.";
    }

    const option = parseInt(message);

    // Process the main switch statement for other states
    switch (option) {
        case 1: // Place an order OR add Jollof Rice (menu item 1)
            // If user is in ordering state, treat this as adding Jollof Rice
            if (session.state === 'ordering') {
                const item = menu[1]; // Jollof Rice
                if (session.currentOrder[1]) {
                    session.currentOrder[1]++;
                } else {
                    session.currentOrder[1] = 1;
                }
                session.state = 'main'; // Return to main state after adding item
                response = `✅ ${item.name} has been added to your order. Current quantity: ${session.currentOrder[1]}`;
                response += `\n\n📋 What's next?\n1️⃣ See menu\n9️⃣9️⃣ Checkout\n9️⃣7️⃣ See current order\n1️⃣0️⃣2️⃣ Schedule order`;
            } else {
                // Show menu (default behavior)
                session.state = 'ordering';
                response = 'Please select an item from the menu:\n';
                for (const key in menu) {
                    response += `${key}. ${menu[key].name} - NGN${menu[key].price}\n`;
                }
                response += `\nEnter the number of an item to add to your order, or type 99 to checkout.`;
            }
            break;

        case 99: // Checkout order
            if (Object.keys(session.currentOrder).length > 0) {
                const { summary } = orderService.formatOrderSummary(session.currentOrder);
                response = summary + `💳 Ready to pay? Type '100' to proceed to payment.`;
            } else {
                response = '🛒 Your cart is empty. Please select 1 to place an order.';
            }
            break;

        case 98: // See order history
            if (session.orderHistory && session.orderHistory.length > 0) {
                response = orderService.formatOrderHistory(session.orderHistory);
            } else {
                response = '📋 No order history.';
            }
            break;

        case 97: // See current order
            if (Object.keys(session.currentOrder).length > 0) {
                response = orderService.formatCurrentOrder(session.currentOrder);
            } else {
                response = 'No current order.';
            }
            break;

        case 0: // Cancel order
            session.currentOrder = {};
            response = 'Order cancelled. Your cart is now empty.';
            break;

        case 100: // Collect customer email before payment processing
            if (Object.keys(session.currentOrder).length > 0) {
                // Change state to collect email
                session.state = 'collecting_email';
                response = `📧 Please provide your email address for the payment receipt:\n\nExample: john.doe@example.com`;
            } else {
                response = 'No order to pay for. Please select 1 to place an order.';
            }
            break;

        case 101: // Simulate payment completion (for demo purposes)
            // Find pending order in the session
            if (session.pendingOrders && Object.keys(session.pendingOrders).length > 0) {
                const pendingOrder = Object.values(session.pendingOrders).find(order => order.status === 'pending');
                if (pendingOrder) {
                    // Update order status to paid
                    pendingOrder.status = 'paid';

                    // Move to order history
                    if (!session.orderHistory) {
                        session.orderHistory = [];
                    }
                    session.orderHistory.push(pendingOrder);

                    // Clear the pending orders
                    session.pendingOrders = {};

                    // Clear the current order
                    session.currentOrder = {};

                    response = `✅ PAYMENT SUCCESSFUL!\n\n`;
                    response += `💰 Amount Paid: NGN${pendingOrder.total}\n`;
                    response += `📋 Order ID: ${pendingOrder.id}\n`;
                    response += `✨ Your order has been confirmed and will be prepared shortly.\n\n`;
                    response += `🙏 Thank you for your patronage!\n\n`;
                    response += `To place another order, select '1' from the main menu.`;
                } else {
                    response = '❌ No pending payment found. Please start a new order by selecting 1.';
                }
            } else {
                response = '❌ No pending payment found. Please start a new order by selecting 1.';
            }
            break;

        case 102: // Schedule an order (optional feature)
            if (Object.keys(session.currentOrder).length > 0) {
                session.isScheduling = true; // Set scheduling flag
                response = 'When would you like to schedule your order? Please enter the date and time in this format: DD/MM/YYYY HH:MM';
            } else {
                response = 'No order to schedule. Please select 1 to place an order first.';
            }
            break;

        case 103: // Check scheduled orders
            if (session.scheduledOrders && session.scheduledOrders.length > 0) {
                response = 'Your scheduled orders:\n';
                session.scheduledOrders.forEach((order, index) => {
                    response += `\nScheduled Order #${index + 1}:`;
                    response += `\n  Scheduled for: ${new Date(order.scheduledTime).toLocaleString()}`;
                    response += `\n  Status: ${order.status}`;
                    response += '\n  Items:\n';
                    for (const itemId in order.items) {
                        const quantity = order.items[itemId];
                        const item = menu[itemId];
                        if (item) {
                            response += `    ${item.name} (x${quantity})\n`;
                        }
                    }
                    response += `  Total: NGN${order.total}\n`;
                });
            } else {
                response = 'No scheduled orders.';
            }
            break;

        default:
            // If user is in scheduling mode, check if it's a valid date/time
            // This is a simplified approach - in a real app, you'd have better date parsing
            if (session.isScheduling && message.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)) {
                // Validate date format DD/MM/YYYY HH:MM
                const [datePart, timePart] = message.split(' ');
                const [day, month, year] = datePart.split('/');
                const [hour, minute] = timePart.split(':');

                const scheduledDate = new Date(year, month - 1, day, hour, minute);

                // Check if the date is valid and in the future
                if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
                    response = 'Invalid date or time. Please enter a future date in the format: DD/MM/YYYY HH:MM';
                } else {
                    // Calculate total
                    let total = 0;
                    for (const itemId in session.currentOrder) {
                        const quantity = session.currentOrder[itemId];
                        const item = menu[itemId];
                        if (item) {
                            total += item.price * quantity;
                        }
                    }

                    // Create scheduled order
                    const scheduledOrder = {
                        id: uuidv4(),
                        items: { ...session.currentOrder },
                        total: total,
                        status: 'scheduled',
                        scheduledTime: scheduledDate.getTime(),
                        timestamp: Date.now()
                    };

                    if (!session.scheduledOrders) {
                        session.scheduledOrders = [];
                    }
                    session.scheduledOrders.push(scheduledOrder);

                    // Clear current order
                    session.currentOrder = {};
                    session.isScheduling = false;

                    response = `Your order has been scheduled for ${scheduledDate.toLocaleString()}. Select 103 to view scheduled orders.`;
                }
            }
            // Check if it's a menu item (excluding 1 which is handled above)
            else if (menu[option] && option !== 1 && (session.state === 'ordering' || session.state === 'main')) {
                const item = menu[option];
                if (session.currentOrder[option]) {
                    session.currentOrder[option]++;
                } else {
                    session.currentOrder[option] = 1;
                }
                session.state = 'main'; // Return to main state after adding item
                response = `✅ ${item.name} has been added to your order. Current quantity: ${session.currentOrder[option]}`;
                response += `\n\n📋 What's next?\n1️⃣ See menu\n9️⃣9️⃣ Checkout\n9️⃣7️⃣ See current order\n1️⃣0️⃣2️⃣ Schedule order`;
            } else {
                response = `❌ Invalid option. Here are your available options:\n\n`;
                response += `🔢 MAIN MENU:\n`;
                response += `1. Place an order - Browse our menu\n`;
                response += `99. Checkout order - Review and pay for your order\n`;
                response += `97. See current order - View items in your cart\n`;
                response += `98. See order history - View past orders\n`;
                response += `0. Cancel order - Clear your cart\n`;
                response += `102. Schedule order - Schedule for later\n\n`;
                response += `💡 After checkout (99), use 100 to pay, then 101 to complete payment.`;
            }
            break;
    }

    return response;
}

// Payment callback endpoint
app.get('/api/payment/callback', async (req, res) => {
    const { reference } = req.query;

    if (!reference) {
        console.error('Payment callback error: Missing reference parameter');
        return res.status(400).send(`
            <html>
                <head><title>Payment Error</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: red;">❌ Payment Error</h1>
                    <p>Reference parameter is missing. Please try again.</p>
                    <p><a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to ChatBot</a></p>
                </body>
            </html>
        `);
    }

    // Verify payment (mock in development, real in production)
    try {
        const verificationResult = await paymentService.verifyPayment(reference);

        if (verificationResult.success) {
            const body = verificationResult;
            console.log(`Payment verification response for reference ${reference}:`, body);

            if (body.data && body.data.status === 'success') {
                const { metadata } = body.data;
                const { orderId, sessionId } = metadata;

                // Find and update the order
                if (sessions[sessionId] && sessions[sessionId].pendingOrders) {
                    const order = sessions[sessionId].pendingOrders[reference];
                    if (order) {
                        // Update order status
                        order.status = 'paid';
                        order.paymentReference = reference;
                        order.paymentAmount = body.data.amount / 100; // Store in NGN
                        order.paymentDate = new Date(body.data.paid_at).toISOString();

                        // Move to order history
                        if (!sessions[sessionId].orderHistory) {
                            sessions[sessionId].orderHistory = [];
                        }
                        sessions[sessionId].orderHistory.push(order);

                        // Clear pending orders and current order
                        delete sessions[sessionId].pendingOrders[reference];
                        sessions[sessionId].currentOrder = {};
                        sessions[sessionId].state = 'main';

                        // Log successful payment
                        console.log(`Payment successful for order ${orderId}, reference: ${reference}, amount: ${body.data.amount / 100} NGN`);

                        // Redirect back to chatbot with success message
                        res.send(`
                            <html>
                                <head><title>Payment Successful</title></head>
                                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                                    <h1 style="color: green;">✅ Payment Successful!</h1>
                                    <p>Your order ${orderId} has been confirmed.</p>
                                    <p>Amount paid: NGN${body.data.amount / 100}</p>
                                    <p>Reference: ${reference}</p>
                                    <p><a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to ChatBot</a></p>
                                </body>
                            </html>
                        `);
                    } else {
                        console.error(`Order not found for reference: ${reference}, session: ${sessionId}`);
                        res.status(404).send(`
                            <html>
                                <head><title>Order Not Found</title></head>
                                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                                    <h1 style="color: red;">❌ Order Not Found</h1>
                                    <p>The order associated with this payment could not be found.</p>
                                    <p>Reference: ${reference}</p>
                                    <p><a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to ChatBot</a></p>
                                </body>
                            </html>
                        `);
                    }
                } else {
                    console.error(`Session not found for payment reference: ${reference}, session: ${sessionId}`);
                    res.status(404).send(`
                        <html>
                            <head><title>Session Not Found</title></head>
                            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                                <h1 style="color: red;">❌ Session Not Found</h1>
                                <p>Your session could not be found. Please try again.</p>
                                <p>Reference: ${reference}</p>
                                <p><a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to ChatBot</a></p>
                            </body>
                        </html>
                    `);
                }
            } else {
                console.error(`Payment verification failed for reference: ${reference}, status: ${body.data?.status || 'unknown'}`);
                res.send(`
                    <html>
                        <head><title>Payment Failed</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1 style="color: red;">❌ Payment Failed</h1>
                            <p>Status: ${body.data?.status || 'unknown'}</p>
                            <p>Reason: ${body.message || 'Payment was not successful'}</p>
                            <p>Reference: ${reference}</p>
                            <p><a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to ChatBot</a></p>
                        </body>
                    </html>
                `);
            }
        } else {
            // Payment verification failed
            console.error(`Payment verification failed for reference: ${reference}`);
            res.send(`
                <html>
                    <head><title>Payment Failed</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: red;">❌ Payment Failed</h1>
                        <p>Payment verification failed</p>
                        <p>Reference: ${reference}</p>
                        <p><a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to ChatBot</a></p>
                    </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Payment verification error for reference:', reference, error);
        res.status(500).send(`
            <html>
                <head><title>Payment Verification Error</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: red;">❌ Payment Verification Error</h1>
                    <p>An error occurred while verifying your payment. Please contact support.</p>
                    <p>Error: ${error.message || 'Verification failed'}</p>
                    <p><a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to ChatBot</a></p>
                </body>
            </html>
        `);
    }
});

// API endpoint for chat messages
app.post('/api/chat', async (req, res) => {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
        return res.status(400).json({
            error: 'Message and sessionId are required'
        });
    }

    try {
        const response = await processChatMessage(message, sessionId);
        res.json({ response });
    } catch (error) {
        console.error('Error processing chat message:', error);
        res.status(500).json({
            error: 'Error processing your message'
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../frontend/index.html');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
