import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  pendingOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);