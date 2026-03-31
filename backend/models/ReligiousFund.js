import mongoose from 'mongoose';

const religiousSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    type: { type: String, enum: ['Donation', 'Expense'], required: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Cash', 'Online'], default: 'Online' },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'House' }, // optional: for donation tracking
    date: { type: Date, default: Date.now },
    description: { type: String }
}, { timestamps: true });

export default mongoose.model('ReligiousFund', religiousSchema);
