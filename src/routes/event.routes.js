import express from 'express';
import Event from '../models/Event.js';
//import { verifyToken } from './auth.js'; // Protect routes for admins
//import upload from '../middleware/upload.js';

const router = express.Router();

// Create an Event with Image/Video Upload (Admin Only)
router.post('/', verifyToken, upload.single('media'), async (req, res) => {
    try {
        const { title, description, date, location } = req.body;
        const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null; // Store file path

        const event = new Event({ title, description, date, location, media: mediaUrl });
        await event.save();
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get All Events (Including Media)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

export default router;
