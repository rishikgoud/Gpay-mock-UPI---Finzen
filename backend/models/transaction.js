import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UPIUser',
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: String,
    senderUpi: {
      type: String,
      required: true,
    },
    receiverUpi: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    source: {
      type: String,
      enum: ['local', 'finzen'],
      default: 'local'
    },
    syncedWithFinzen: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction; 