import mongoose from 'mongoose';

const debitSchema = new mongoose.Schema({
    expenseName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Cash', 'Online'], default: 'Online' },
    date: { type: Date, default: Date.now },
    description: { type: String },
    vendorName: { type: String }
}, { timestamps: true });

export default mongoose.model('Debit', debitSchema);
