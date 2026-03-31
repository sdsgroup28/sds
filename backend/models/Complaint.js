import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
    dateRegistered: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
