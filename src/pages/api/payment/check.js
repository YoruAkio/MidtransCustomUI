import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Midtrans from "midtrans-client";

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
    
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    
    console.log(`Checking payment status for order: ${orderId}`);
    
    // Get order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if order is already processed
    if (order.status === "success") {
      return res.status(200).json({
        success: true,
        status: "success",
        order,
      });
    }

    // For Midtrans QRIS payments, we need to check transaction status
    try {
      // Check status with Midtrans
      const transactionStatus = await core.transaction.status(orderId);
      console.log(`Transaction status for ${orderId}:`, transactionStatus);
      
      let orderStatus = order.status;
      
      // Update order status based on transaction status
      if (["settlement", "capture", "accept"].includes(transactionStatus.transaction_status)) {
        orderStatus = "success";
        order.status = "success";
        order.paymentMethod = transactionStatus.payment_type;
        order.transactionId = transactionStatus.transaction_id;
        order.completedAt = new Date();
        await order.save();
      } else if (["deny", "cancel", "expire", "failure"].includes(transactionStatus.transaction_status)) {
        orderStatus = "failed";
        order.status = "failed";
        await order.save();
      }
      // else: leave as pending
      
      return res.status(200).json({
        success: true,
        status: orderStatus,
        order,
        transactionDetails: transactionStatus,
      });
    } catch (error) {
      console.error(`Error checking transaction with Midtrans: ${error.message}`);
      
      // If Midtrans API fails, just return current status from our database
      return res.status(200).json({
        success: true,
        status: order.status,
        order,
        error: "Could not verify with payment provider",
      });
    }
  } catch (error) {
    console.error("Error checking payment:", error);
    return res.status(500).json({ message: "Error checking payment", success: false });
  }
}

// import Midtrans from "midtrans-client";
// import dbConnect from "@/lib/mongodb";
// import User from "@/models/User";
// import Order from "@/models/Order";

// // Use same Core API configuration as in create.js
// const core = new Midtrans.CoreApi({
//   isProduction: false,
//   serverKey: process.env.MIDTRANS_SERVER_KEY,
//   clientKey: process.env.MIDTRANS_CLIENT_KEY,
// });

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     await dbConnect();
    
//     const { orderId } = req.body;
    
//     if (!orderId) {
//       return res.status(400).json({ message: "Order ID is required" });
//     }
    
//     // Get order from database
//     const order = await Order.findOne({ orderId });
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }
    
//     // Check payment status with Midtrans
//     try {
//       console.log("Checking status for order:", orderId);
//       console.log("Using server key with prefix:", process.env.MIDTRANS_SERVER_KEY?.substring(0, 10) + "...");
      
//       const transactionStatus = await core.transaction.status(orderId);
//       console.log("Transaction status response:", JSON.stringify(transactionStatus));
      
//       let orderStatus = 'pending';
      
//       // Update order status based on transaction status
//       if (transactionStatus.transaction_status === 'settlement') {
//         orderStatus = 'success';
//         order.status = 'success';
//         order.completedAt = new Date();
//       } else if (transactionStatus.transaction_status === 'pending') {
//         orderStatus = 'pending';
//       } else {
//         orderStatus = 'failed';
//         order.status = 'failed';
//       }
      
//       await order.save();
      
//       return res.status(200).json({
//         success: true,
//         status: orderStatus,
//         order,
//         transactionStatus,
//       });
//     } catch (midtransError) {
//       console.error("Midtrans API error:", midtransError);
      
//       // Check if order is expired
//       if (order.expiryTime && new Date() > new Date(order.expiryTime)) {
//         order.status = 'failed';
//         await order.save();
        
//         return res.status(200).json({
//           success: true,
//           status: 'failed',
//           order,
//           message: 'Payment expired'
//         });
//       }
      
//       // Return pending status if Midtrans check fails but order hasn't expired
//       return res.status(200).json({
//         success: true,
//         status: order.status,
//         order
//       });
//     }
//   } catch (error) {
//     console.error("Error checking payment:", error);
//     return res.status(500).json({ message: "Error checking payment" });
//   }
// }