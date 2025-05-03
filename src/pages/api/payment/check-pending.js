import User from "@/models/User";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongodb";
import Midtrans from "midtrans-client";

// Initialize Midtrans Core API for refreshing QR codes if needed
const core = new Midtrans.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // Find user with populated pending order
    const user = await User.findById(userId);
    if (!user || !user.pendingOrder) {
      return res.status(200).json({
        hasPendingOrder: false
      });
    }
    
    // Find the pending order details
    const pendingOrder = await Order.findById(user.pendingOrder);
    if (!pendingOrder || pendingOrder.status !== "pending") {
      // No valid pending order - clean up reference on user
      user.pendingOrder = undefined;
      await user.save();
      
      return res.status(200).json({
        hasPendingOrder: false
      });
    }
    
    // Check if order has expired (15 minutes)
    const now = new Date();
    const expiryTime = pendingOrder.expiryTime || 
      new Date(pendingOrder.createdAt.getTime() + 15 * 60 * 1000);
      
    if (now > expiryTime) {
      // Order has expired
      pendingOrder.status = "expired";
      await pendingOrder.save();
      
      user.pendingOrder = undefined;
      await user.save();
      
      return res.status(200).json({
        hasPendingOrder: false,
        message: "Payment has expired"
      });
    }
    
    // If QR code URL is missing, try to refresh it from Midtrans
    let qrCodeUrl = pendingOrder.qrCodeUrl;
    
    // If QR code URL is missing or we want to ensure it's fresh, get it from Midtrans
    if (!qrCodeUrl || true) { // Always refresh for now to ensure it's valid
      try {
        // Get transaction status which includes actions
        const transactionStatus = await core.transaction.status(pendingOrder.orderId);
        console.log(`Transaction status for ${pendingOrder.orderId}:`, transactionStatus);
        
        // Find QR code URL in actions
        if (transactionStatus.actions) {
          const qrAction = transactionStatus.actions.find(action => action.name === "generate-qr-code");
          if (qrAction && qrAction.url) {
            qrCodeUrl = qrAction.url;
            
            // Update the order with the fresh QR code URL
            pendingOrder.qrCodeUrl = qrCodeUrl;
            await pendingOrder.save();
          }
        }
      } catch (error) {
        console.error("Error refreshing QR code:", error);
        // Continue with existing QR code if available
      }
    }
    
    // Return pending order details with QR code URL
    return res.status(200).json({
      hasPendingOrder: true,
      order: {
        _id: pendingOrder._id,
        orderId: pendingOrder.orderId,
        serviceType: pendingOrder.serviceType,
        price: pendingOrder.price,
        status: pendingOrder.status,
        createdAt: pendingOrder.createdAt,
        expiryTime: expiryTime
      },
      qrCodeUrl: qrCodeUrl
    });
  } catch (error) {
    console.error("Error checking pending payment:", error);
    return res.status(500).json({ message: "Error checking pending payment" });
  }
}