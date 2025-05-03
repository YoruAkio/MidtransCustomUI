import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import Order from '../../../models/Order';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { userId, orderId } = req.body;
    
    if (!userId || !orderId) {
      return res.status(400).json({ message: 'User ID and Order ID are required' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get order
    const order = await Order.findOne({ orderId, userId: user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status
    order.status = 'cancelled';
    await order.save();
    
    // Remove pending order from user
    user.pendingOrder = null;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return res.status(500).json({ message: 'Error cancelling payment' });
  }
}