import mongoose from 'mongoose';

const PaymentLockSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now, expires: 30 }, // auto-expire after 30s
});

export default mongoose.model('PaymentLock', PaymentLockSchema); 