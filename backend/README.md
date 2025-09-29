# Restaurant ChatBot with Paystack Integration

This is a restaurant ordering chatbot that integrates with Paystack for secure payment processing.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the backend directory with your Paystack credentials:
   ```env
   # Paystack Configuration
   PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
   PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

   # Application Configuration
   NODE_ENV=development
   PORT=3001
   BASE_URL=http://localhost:3001
   ```

3. Start the server:
   ```bash
   npm run dev  # For development with auto-restart
   # or
   npm start    # For production
   ```

## Paystack Configuration

1. Sign up for a Paystack account at [paystack.com](https://paystack.com)
2. Get your test and live API keys from the dashboard
3. Add the keys to your `.env` file
4. For testing, use Paystack's test card: `4084084084084081`

## Payment Flow

1. User places an order and goes to checkout (option 99)
2. User initiates payment (option 100)
3. System prompts for customer email
4. System collects email and initializes payment with Paystack
5. User is redirected to Paystack payment page
6. After payment, user is redirected back to the chatbot
7. Payment status is verified with Paystack's API

## Environment Variables

- `PAYSTACK_SECRET_KEY`: Your Paystack secret key (required)
- `PAYSTACK_PUBLIC_KEY`: Your Paystack public key (required)
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 3001)
- `BASE_URL`: Base URL of your application (for payment callbacks)

## Available Commands

- `1`: Place an order (browse menu)
- `99`: Checkout order
- `98`: See order history
- `97`: See current order
- `0`: Cancel order
- `100`: Start payment process
- `101`: Complete payment (for testing)
- `102`: Schedule order
