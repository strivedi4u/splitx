const router = require('express').Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/users/search?email= or ?name=
router.get('/search', (req, res) => {
    try {
        const { email, name } = req.query;
        if (!email && !name)
            return res.status(400).json({ success: false, message: 'Provide email or name to search' });

        let users = db.getAll('users');
        if (email) users = users.filter(u => u.email.toLowerCase().includes(email.toLowerCase()));
        else users = users.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));

        const safe = users.slice(0, 10).map(({ password, ...u }) => u);
        res.status(200).json({ success: true, users: safe });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
    try {
        const user = db.getById('users', req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const { password, ...safe } = user;
        res.status(200).json({ success: true, user: safe });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
