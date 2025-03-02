import {Router} from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { loginAdmin, registerAdmin } from '../controllers/user.controllers.js';
import { verifyJWT } from '../middleware/auth.middleware.js';




const router = Router();

router.route("/registerAdmin").post(registerAdmin);
router.route("/login").post(verifyJWT, loginAdmin);




// old admin login codes
{
// Admin Login
// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         const admin = await Admin.findOne({ username });
//         if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

//         const isMatch = await bcrypt.compare(password, admin.password);
//         if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

//         const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         res.json({ token });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // Middleware for protected routes
// const verifyToken = (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (!token) return res.status(403).json({ message: 'Access denied' });

//     try {
//         const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
//         req.admin = decoded;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Invalid token' });
//     }
// };

// // Protected Admin Route
// router.get('/admin', verifyToken, async (req, res) => {
//     try {
//         const admin = await Admin.findById(req.admin.id).select('-password');
//         res.json(admin);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });
}

export default router;
