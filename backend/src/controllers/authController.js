const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const AVATARS = ['😎', '🧑‍💻', '👩‍🎨', '🎯', '💫', '🚀', '🦊', '🐱', '🌟', '🔥', '💎', '🎪'];
const COLORS = ['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const safeUser = (u) => {
    const { password, ...rest } = u;
    return rest;
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        if (password.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

        const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 12);
        const user = {
            id: uuidv4(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashed,
            avatar: rand(AVATARS),
            color: rand(COLORS),
            createdAt: new Date().toISOString(),
        };
        db.insert('users', user);

        const token = signToken(user.id);
        res.status(201).json({ success: true, token, user: safeUser(user) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password are required' });

        const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const token = signToken(user.id);
        res.status(200).json({ success: true, token, user: safeUser(user) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/me
exports.getMe = (req, res) => {
    res.status(200).json({ success: true, user: safeUser(req.user) });
};

// PATCH /api/auth/profile
exports.updateProfile = (req, res) => {
    try {
        const { name, avatar, color } = req.body;
        const updates = {};
        if (name) updates.name = name.trim();
        if (avatar) updates.avatar = avatar;
        if (color) updates.color = color;

        const updated = db.updateById('users', req.user.id, updates);
        res.status(200).json({ success: true, user: safeUser(updated) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({ success: false, message: 'Both passwords required' });

        const user = db.getById('users', req.user.id);
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

        const hashed = await bcrypt.hash(newPassword, 12);
        db.updateById('users', req.user.id, { password: hashed });

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
