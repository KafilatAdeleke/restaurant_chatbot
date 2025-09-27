# Restaurant ChatBot with Paystack Integration

A chatbot for ordering food with secure payment processing via Paystack.

## Project Structure

```
chatbot/
├── backend/          # Express.js server with Paystack integration
│   ├── index.js      # Main server file
│   ├── .env          # Environment variables
│   └── README.md     # Backend setup instructions
├── frontend/         # HTML/CSS/JS files for chatbot interface
│   ├── index.html
│   ├── script.js
│   └── style.css
└── .kiro/            # Design and requirements specs
    └── specs/
        └── paystack-payment-integration/
```

## Setup

### Backend
1. Navigate to the `backend` directory
2. Install dependencies: `npm install`
3. Set up environment variables (see backend README)
4. Start the server: `npm run dev`

### Frontend
The frontend is served automatically by the backend server.

## Usage

1. Start the backend server
2. Open your browser and navigate to `http://localhost:3001`
3. Interact with the chatbot to place orders and make payments

## Payment Integration

The system integrates with Paystack for secure payment processing:
- Customers can place orders via the chatbot
- Payment is processed securely through Paystack
- Order history is maintained per session
- Email receipts are sent to customers

For complete setup instructions, see the README in the backend directory.