import express from 'express';
import Maintenance from '../models/Maintenance.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const records = await Maintenance.find({}).populate('houseId');
    res.json(filterDuplicates(records));
});

router.get('/my/:clerkUserId', async (req, res) => {
    try {
        const House = (await import('../models/House.js')).default;
        const house = await House.findOne({ clerkUserId: req.params.clerkUserId });
        if (!house) return res.json([]);
        
        const records = await Maintenance.find({ houseId: house._id }).populate('houseId');
        res.json(filterDuplicates(records));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const filterDuplicates = (records) => {
    const map = new Map();
    records.forEach(r => {
        const key = `${r.houseId?._id || r.houseId}_${r.month}_${r.subject || 'Maintenance'}`;
        if (!map.has(key)) {
            map.set(key, r);
        } else {
            const existing = map.get(key);
            if (r.paidAmount > existing.paidAmount) {
                map.set(key, r);
            } else if (r.paidAmount === existing.paidAmount) {
                if (new Date(r.createdAt) > new Date(existing.createdAt)) {
                    map.set(key, r);
                }
            }
        }
    });

    let uniqueRecords = Array.from(map.values());
    const ranges = uniqueRecords.filter(r => r.month && r.month.includes(' to '));
    if (ranges.length > 0) {
        uniqueRecords = uniqueRecords.filter(r => {
            if (r.month && r.month.includes(' to ')) return true;
            for (const rangeRecord of ranges) {
                if ((rangeRecord.houseId?._id || rangeRecord.houseId).toString() !== (r.houseId?._id || r.houseId).toString()) continue;
                if ((rangeRecord.subject || 'Maintenance') !== (r.subject || 'Maintenance')) continue;
                const [start, end] = rangeRecord.month.split(' to ');
                if (r.month >= start && r.month <= end) {
                    return false;
                }
            }
            return true;
        });
    }
    return uniqueRecords;
};

// Auto-generate ₹500 bills for all houses for current month
router.post('/auto-generate', async (req, res) => {
    try {
        const House = (await import('../models/House.js')).default;
        
        const today = new Date();
        const year = today.getFullYear();
        const monthStr = String(today.getMonth() + 1).padStart(2, '0');
        const period = `${year}-${monthStr}`;

        const houses = await House.find({});
        let generatedCount = 0;

        for (const house of houses) {
            const existingRecords = await Maintenance.find({ houseId: house._id });
            const isCovered = existingRecords.some(r => {
                if (r.month === period) return true;
                if (r.month && r.month.includes(' to ')) {
                    const [start, end] = r.month.split(' to ');
                    if (period >= start && period <= end) return true;
                }
                return false;
            });

            if (!isCovered) {
                const monthlyRate = house.propertyType === 'Plot' ? 250 : 500;
                const newMaint = new Maintenance({
                    houseId: house._id,
                    month: period,
                    year: year,
                    amount: monthlyRate
                });
                await newMaint.save();
                generatedCount++;
            }
        }
        res.status(200).json({ message: `Successfully generated ${generatedCount} new maintenance bills for ${period}.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/pay-advance', async (req, res) => {
    try {
        const House = (await import('../models/House.js')).default;
        const Payment = (await import('../models/Payment.js')).default;
        const { houseId, monthsToPay, paymentMode, chequeDetails } = req.body;

        const house = await House.findById(houseId);
        if (!house) return res.status(404).json({ error: 'House not found' });

        const monthlyRate = house.propertyType === 'Plot' ? 250 : 500;
        const totalAmount = monthlyRate * monthsToPay;
        
        // Find existing maintenance strictly for "Maintenance" subject to find the last paid month
        const existing = await Maintenance.find({ houseId: house._id, subject: 'Maintenance' }).sort({ year: -1, month: -1 });
        
        // Determine starting period
        let startDate = new Date();
        if (existing.length > 0) {
            // Check if there are any unpaid existing bills before allowing advance payment
            const hasUnpaid = existing.some(e => e.status !== 'Paid');
            if (hasUnpaid) {
                return res.status(400).json({ error: 'Please clear all pending maintenance dues before generating new advance payments.' });
            }

            const latest = existing[0];
            const latestStr = latest.month;
            const endMonthStr = latestStr.includes(' to ') ? latestStr.split(' to ')[1] : latestStr;
            const [y, m] = endMonthStr.split('-');
            startDate = new Date(parseInt(y), parseInt(m), 1); 
        }

        const generated = [];
        const isPendingVer = (paymentMode === 'Cash' || paymentMode === 'Cheque');
        const status = isPendingVer ? 'Verification Pending' : 'Paid';

        let currentDate = startDate;
        const startY = currentDate.getFullYear();
        const startM = String(currentDate.getMonth() + 1).padStart(2, '0');
        const startPeriod = `${startY}-${startM}`;

        currentDate.setMonth(currentDate.getMonth() + (monthsToPay - 1));
        const endY = currentDate.getFullYear();
        const endM = String(currentDate.getMonth() + 1).padStart(2, '0');
        const endPeriod = `${endY}-${endM}`;
        
        const periodStr = monthsToPay > 1 ? `${startPeriod} to ${endPeriod}` : startPeriod;

        // Rebate Logic: Check if 12 consecutive months starting from April (month 04)
        // and it is for the *next* upcoming financial year relative to the current real date
        let isRebateApplied = false;
        let rebateAmount = 0;
        let finalPayAmount = totalAmount;
        let financialYear = '';

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const requiredStartY = currentMonth >= 4 ? currentYear + 1 : currentYear;

        if (monthsToPay === 12 && startM === '04' && startY >= requiredStartY) {
            isRebateApplied = true;
            rebateAmount = monthlyRate; // 1 month rebate
            finalPayAmount = totalAmount - rebateAmount;
            financialYear = `${startY}-${endY}`;
        }

        const newMaint = new Maintenance({
            houseId: house._id,
            month: periodStr,
            year: startY,
            amount: totalAmount,
            paidAmount: finalPayAmount,
            subject: 'Maintenance',
            status: status,
            paymentMode: paymentMode,
            adminApproved: !isPendingVer,
            rebateApplied: isRebateApplied,
            rebateAmount: rebateAmount,
            financialYear: financialYear,
            chequeDetails: paymentMode === 'Cheque' ? chequeDetails : undefined
        });
        await newMaint.save();
        generated.push(newMaint);

        const newPayment = new Payment({
            houseId: house._id,
            amount: finalPayAmount,
            paymentMode,
            receiptNumber: 'REC' + Date.now(),
            status: 'Completed'
        });
        await newPayment.save();

        if (isRebateApplied) {
            const Debit = (await import('../models/Debit.js')).default;
            const expense = new Debit({
                expenseName: `Advance Maintenance Rebate - ${house.houseId}`,
                amount: rebateAmount,
                paymentMode: 'Online',
                description: `Rebate applied for advance maintenance of ${house.houseId} for FY ${financialYear}. Property type: ${house.propertyType}`,
                vendorName: house.ownerName
            });
            await expense.save();
        }

        res.status(201).json({ message: 'Success', generated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (!req.body.subject || req.body.subject === 'Maintenance') {
            const existingRecords = await Maintenance.find({ houseId: req.body.houseId, subject: req.body.subject || 'Maintenance' });
            const isCovered = existingRecords.some(r => {
                if (r.month === req.body.month) return true;
                if (r.month && r.month.includes(' to ') && req.body.month && !req.body.month.includes(' to ')) {
                    const [start, end] = r.month.split(' to ');
                    if (req.body.month >= start && req.body.month <= end) return true;
                }
                return false;
            });

            if (isCovered) {
                return res.status(400).json({ error: 'A maintenance bill for this month already exists or is covered by an advance payment. You can only pay or generate 1 month once.' });
            }
        }
        const data = { ...req.body };
        if (data.isHistorical) {
            data.status = 'Paid';
            data.adminApproved = true;
            if (data.rebateApplied) {
                data.paidAmount = data.amount - data.rebateAmount;
            } else {
                data.paidAmount = data.amount;
            }
            // transactionDate is already provided in req.body.transactionDate
        }

        const newRecord = new Maintenance(data);
        await newRecord.save();

        if (data.isHistorical && data.rebateApplied) {
            const House = (await import('../models/House.js')).default;
            const house = await House.findById(data.houseId);
            const Debit = (await import('../models/Debit.js')).default;
            const expense = new Debit({
                expenseName: `Historical Maintenance Rebate - ${house?.houseId || 'Unknown'}`,
                amount: data.rebateAmount,
                paymentMode: data.paymentMode || 'Cash',
                description: `Historical rebate applied for FY ${data.financialYear || 'N/A'}. Date: ${data.transactionDate}`,
                vendorName: house?.ownerName || 'Society Member',
                date: new Date(data.transactionDate || Date.now())
            });
            await expense.save();
        }

        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const doc = await Maintenance.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Maintenance record not found' });
        
        Object.assign(doc, req.body);
        await doc.save(); // Calls the pre-save hook
        res.json(doc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
