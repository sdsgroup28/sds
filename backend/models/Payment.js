import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    maintenanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance' },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Cash', 'Online', 'Cheque'], required: true },
    transactionId: { type: String },
    date: { type: Date, default: Date.now },
    receiptNumber: { type: String, unique: true }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
