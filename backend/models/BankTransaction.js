import mongoose from 'mongoose';

const bankTransactionSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    subject: { type: String, required: true }, // e.g., 'Bank Interest'
    description: { type: String },
    type: { type: String, enum: ['Credit', 'Debit'], required: true },
    amount: { type: Number, required: true },
    interestAmount: { type: Number, default: 0 }, // For the "include interest if exists" logic
    mode: { type: String, default: 'Online' }
}, { timestamps: true });

export default mongoose.model('BankTransaction', bankTransactionSchema);
