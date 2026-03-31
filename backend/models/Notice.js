import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    author: { type: String, default: 'Admin' }
}, { timestamps: true });

export default mongoose.model('Notice', noticeSchema);
