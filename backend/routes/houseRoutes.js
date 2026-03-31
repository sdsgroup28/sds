import express from 'express';
import House from '../models/House.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const houses = await House.find({});
    res.json(houses);
});

router.get('/my/:clerkUserId', async (req, res) => {
    try {
        const house = await House.findOne({ clerkUserId: req.params.clerkUserId });
        res.json(house);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/link-user', async (req, res) => {
    try {
        const { clerkUserId, houseId, ownerName, contact, address, livingStatus, tenantName, tenantContact } = req.body;
        
        let house = await House.findOne({ houseId });
        if (house) {
            if (house.clerkUserId && house.clerkUserId !== clerkUserId) {
                return res.status(400).json({ error: 'This house identifier is already registered to another resident.' });
            }
            house.clerkUserId = clerkUserId;
            if (ownerName) house.ownerName = ownerName;
            if (contact) house.contact = contact;
            if (address) house.address = address;
            if (livingStatus) house.livingStatus = livingStatus;
            if (tenantName !== undefined) house.tenantDetails.name = tenantName;
            if (tenantContact !== undefined) house.tenantDetails.contact = tenantContact;
            await house.save();
        } else {
            house = new House({ 
                houseId, ownerName, contact, address, clerkUserId, 
                livingStatus: livingStatus || 'Owner Living',
                tenantDetails: { name: tenantName || '', contact: tenantContact || '' }
            });
            await house.save();
        }
        res.status(200).json(house);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newHouse = new House(req.body);
        await newHouse.save();
        res.status(201).json(newHouse);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/unlink/:id', async (req, res) => {
    try {
        const house = await House.findById(req.params.id);
        if (!house) return res.status(404).json({ error: 'House not found' });
        house.clerkUserId = null;
        await house.save();
        res.json({ message: 'Resident account unlinked successfully', house });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await House.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await House.findByIdAndDelete(req.params.id);
        res.json({ message: 'House deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
