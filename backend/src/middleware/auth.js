const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = db.getById('users', decoded.id);
        if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });

        const { password, ...safeUser } = user;
        req.user = safeUser;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token' });
        if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired. Please log in again' });
        res.status(500).json({ success: false, message: err.message });
    }
};
