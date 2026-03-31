import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// Get categories by type
router.get('/:type', async (req, res) => {
    try {
        const cats = await Category.find({ type: req.params.type });
        res.json(cats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create category
router.post('/', async (req, res) => {
    try {
        const cat = new Category(req.body);
        await cat.save();
        res.status(201).json(cat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update category
router.put('/:id', async (req, res) => {
    try {
        const cat = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        res.json(cat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
