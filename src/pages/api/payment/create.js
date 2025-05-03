import Midtrans from "midtrans-client";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

// Initialize Midtrans Core API instead of Snap
const core = new Midtrans.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const PRICES = {
  portfolio: 100000, // IDR 100K
  landing: 250000, // IDR 250K
  custom: 400000, // IDR 400K
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { userId, serviceType } = req.body;

    if (!userId || !serviceType) {
      return res
        .status(400)
        .json({ message: "User ID and service type are required" });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has pending order
    if (user.pendingOrder) {
      const pendingOrder = await Order.findById(user.pendingOrder);
      if (pendingOrder && pendingOrder.status === "pending") {
        return res.status(400).json({
          message:
            "You have a pending order. Please complete or cancel it first.",
          pendingOrder,
        });
      }
    }

    // Get price based on service type
    const price = PRICES[serviceType];
    if (!price) {
      return res.status(400).json({ message: "Invalid service type" });
    }

    // Generate order ID
    const orderId = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    // Create QRIS payment
    const paymentResponse = await core.charge({
      payment_type: "qris",
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      qris: {
        acquirer: "gopay", // or other acquirers like "airpay"
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
    });

    // log the paymentResponse
    console.log(`Payment Response: ${JSON.stringify(paymentResponse)}`)
    const QrUrl = paymentResponse.actions.find(
      (action) => action.name === "generate-qr-code"
    ).url

    // Create order in database
    const order = await Order.create({
      orderId,
      userId,
      serviceType,
      price,
      status: "pending",
      qrCodeUrl: QrUrl,
      expiryTime: new Date(Date.now() + 15 * 60000), // 15 minutes expiry
    });

    // Update user with pending order reference
    user.pendingOrder = order._id;
    await user.save();

    return res.status(200).json({
      success: true,
      order,
      qrCodeUrl: QrUrl,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({ message: "Error creating payment" });
  }
}
