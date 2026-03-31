import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Festival', 'DueType'], required: true }
});

export default mongoose.model('Category', categorySchema);
