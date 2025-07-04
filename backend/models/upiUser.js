import mongoose from 'mongoose';

const upiUserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  upiId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  transactionHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
});

export default mongoose.model('UPIUser', upiUserSchema); 