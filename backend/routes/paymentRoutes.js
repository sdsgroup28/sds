import express from 'express';
import Payment from '../models/Payment.js';
import Maintenance from '../models/Maintenance.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const payments = await Payment.find({}).populate('houseId maintenanceId');
    res.json(payments);
});

router.post('/', async (req, res) => {
    try {
        const receiptNumber = 'REC' + Date.now();
        const newPayment = new Payment({ ...req.body, receiptNumber });
        await newPayment.save();

        if (req.body.maintenanceId) {
            const maint = await Maintenance.findById(req.body.maintenanceId);
            if (maint) {
                maint.paidAmount += req.body.amount;
                maint.pendingAmount = maint.amount - maint.paidAmount;
                if (maint.pendingAmount <= 0) {
                    maint.status = 'Paid';
                }
                if (req.body.paymentMode) {
                    maint.paymentMode = req.body.paymentMode;
                }
                if (req.body.chequeDetails) {
                    maint.chequeDetails = req.body.chequeDetails;
                }
                await maint.save();
            }
        }
        res.status(201).json(newPayment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
