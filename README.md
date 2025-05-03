# 🚀 Midtrans Custom Payment Integration

A Next.js application with custom Midtrans payment integration using Core API instead of the default Snap UI.

## 💡 Features

- ✨ Custom payment UI with modern, responsive design
- 💳 QRIS payment support (GoPay, ShopeePay, OVO, DANA)
- ⏱️ Real-time payment status checking
- 🔄 Automatic QR code generation and display
- 🛡️ Secure payment processing with Midtrans Core API
- 📱 Mobile-friendly interface

## 🔧 Setup & Configuration

### Prerequisites

- Node.js 14.x or higher
- MongoDB database
- Midtrans account and API keys

### Environment Variables

Create a `.env.local` file in the root directory:

```
MONGODB_URI=your_mongodb_connection_string
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## 🔄 Payment Flow

1. **User Information Collection**
   - Collects name and email through `UserInfoModal`
   - Creates user record in database

2. **Service Selection**
   - User selects service type (portfolio, landing, custom)
   - Each service type has predefined pricing

3. **Payment Processing**
   - Creates order in database
   - Generates QRIS payment code via Midtrans Core API
   - Displays QR code in custom `PaymentModal`

4. **Payment Status Checking**
   - Automatic polling every 15 seconds
   - Manual checking via "I've completed the payment" button
   - Shows success/failure messages based on payment status

5. **Pending Payment Handling**
   - Detects and manages existing pending payments
   - Allows users to complete or cancel pending transactions

## 📦 Main Components

### 🖥️ Modal Components

- **`PaymentModal`**: Displays payment QR code and handles status checking
- **`PendingPaymentModal`**: Manages existing pending payments
- **`UserInfoModal`**: Collects user information before payment

### 🔌 API Endpoints

- **`/api/payment/create`**: Creates a new payment transaction with Midtrans
- **`/api/payment/check`**: Checks payment status with Midtrans
- **`/api/payment/check-pending`**: Checks for existing pending payments
- **`/api/payment/cancel`**: Cancels pending payments

## 💻 Usage Example

```javascript
// Creating a payment order
const createOrder = async (serviceType) => {
  try {
    const response = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userData._id,
        serviceType,  // 'portfolio', 'landing', or 'custom'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Show payment modal with QR code
      setOrderData(data.order);
      setPaymentModalOpen(true);
    }
  } catch (error) {
    console.error("Error creating order:", error);
  }
};
```

## 🔍 Customization

### Pricing

Modify the prices in create.js:

```javascript
const PRICES = {
  portfolio: 100000, // IDR 100K
  landing: 250000,   // IDR 250K
  custom: 400000,    // IDR 400K
};
```

### Payment UI

You can customize the payment modal appearance by editing the components in `src/components/modals/`.

## 📝 Additional Information

- Payment expiration: 15 minutes from creation
- Supported payment methods: All QRIS-compatible apps (GoPay, ShopeePay, OVO, DANA, etc.)
- Order IDs format: `ORDER-[timestamp]-[random]`

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📜 License

This project is [MIT](LICENSE) licensed.