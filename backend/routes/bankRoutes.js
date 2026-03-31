import express from 'express';
import BankTransaction from '../models/BankTransaction.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const records = await BankTransaction.find({});
    res.json(records);
});

router.post('/', async (req, res) => {
    try {
        const newRecord = new BankTransaction(req.body);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
