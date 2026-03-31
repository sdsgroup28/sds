import express from 'express';
import Debit from '../models/Debit.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const debits = await Debit.find({});
    res.json(debits);
});

router.post('/', async (req, res) => {
    try {
        const newDebit = new Debit(req.body);
        await newDebit.save();
        res.status(201).json(newDebit);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
