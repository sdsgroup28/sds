import express from 'express';
import Notice from '../models/Notice.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const notices = await Notice.find({}).sort({ date: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.status(201).json(newNotice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notice deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
