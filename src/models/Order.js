import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceType: {
    type: String,
    enum: ["portfolio", "landing", "custom"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "success", "failed", "expired", "cancelled"],
    default: "pending",
  },
  qrCodeUrl: {
    type: String,
    required: true,
  },
  expiryTime: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  transactionId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.Order || model("Order", OrderSchema);