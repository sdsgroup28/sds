import express from 'express';
import Complaint from '../models/Complaint.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const complaints = await Complaint.find({}).populate('houseId');
    res.json(complaints);
});

router.get('/my/:clerkUserId', async (req, res) => {
    try {
        const House = (await import('../models/House.js')).default;
        const house = await House.findOne({ clerkUserId: req.params.clerkUserId });
        if (!house) return res.json([]);
        
        const complaints = await Complaint.find({ houseId: house._id }).populate('houseId');
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        await newComplaint.save();
        res.status(201).json(newComplaint);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
