const router = require('express').Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const sseService = require('../services/sseService');

// Simple token-based protection for admin
const adminAuth = (req, res, next) => {
    const token = req.headers['x-admin-token'] || req.query.token;
    if (token !== (process.env.ADMIN_TOKEN || 'splitx-admin-2024')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
};

// GET /api/admin/stats
router.get('/stats', adminAuth, (req, res) => {
    try {
        const users = db.getAll('users');
        const groups = db.getAll('groups');
        const expenses = db.getAll('expenses');
        const settlements = db.getAll('settlements');
        const activities = db.getAll('activities');

        // Total spend
        const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

        // Spend by category
        const categoryMap = {};
        expenses.forEach(e => {
            categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
        });
        const byCategory = Object.entries(categoryMap).map(([name, amount]) => ({ name, amount }));

        // Spend by day (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
        const dayMap = {};
        recentExpenses.forEach(e => {
            const day = e.date.slice(0, 10);
            dayMap[day] = (dayMap[day] || 0) + e.amount;
        });
        const byDay = Object.entries(dayMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Top spenders
        const spenderMap = {};
        expenses.forEach(e => {
            spenderMap[e.paidBy] = (spenderMap[e.paidBy] || 0) + e.amount;
        });
        const topSpenders = Object.entries(spenderMap)
            .map(([uid, amount]) => {
                const u = users.find(u => u.id === uid);
                return { user: u ? { id: u.id, name: u.name, avatar: u.avatar } : { id: uid, name: 'Unknown', avatar: '👤' }, amount };
            })
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Active users (users who have expenses)
        const activeUserIds = new Set(expenses.map(e => e.paidBy));
        const activeUsers = users.filter(u => activeUserIds.has(u.id)).map(({ password, ...u }) => u);

        // Recent activity
        const recentActivity = activities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 20)
            .map(a => {
                const u = users.find(u => u.id === a.userId);
                const g = groups.find(g => g.id === a.groupId);
                return { ...a, userName: u?.name || 'Unknown', groupName: g?.name || 'Unknown', userAvatar: u?.avatar || '👤' };
            });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers: users.length,
                activeUsers: activeUserIds.size,
                totalGroups: groups.length,
                totalExpenses: expenses.length,
                totalSettlements: settlements.length,
                totalSpend: Math.round(totalSpend * 100) / 100,
                avgExpense: expenses.length ? Math.round(totalSpend / expenses.length * 100) / 100 : 0,
            },
            byCategory,
            byDay,
            topSpenders,
            activeUsers,
            recentActivity,
            allGroups: groups.map(g => ({
                ...g,
                memberCount: g.members.length,
                expenseCount: expenses.filter(e => e.groupId === g.id).length,
                totalSpend: Math.round(expenses.filter(e => e.groupId === g.id).reduce((s, e) => s + e.amount, 0) * 100) / 100,
            })),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// GET /api/admin/users/all
router.get('/users/all', adminAuth, (req, res) => {
    try {
        const users = db.getAll('users');
        const groups = db.getAll('groups');
        const expenses = db.getAll('expenses');

        const allUsers = users.map(u => {
            const userGroups = groups.filter(g => g.members.includes(u.id));
            const userExpenses = expenses.filter(e => e.paidBy === u.id);
            const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);

            return {
                ...u,
                groupsCount: userGroups.length,
                expensesCount: userExpenses.length,
                totalSpent: Math.round(totalSpent * 100) / 100
            };
        });

        res.status(200).json({ success: true, count: allUsers.length, users: allUsers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminAuth, (req, res) => {
    try {
        const userId = req.params.id;
        const user = db.getById('users', userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        db.deleteById('users', userId);

        // Verification step: ensure user is fully removed
        const stillExists = db.getById('users', userId);
        if (stillExists) {
            return res.status(500).json({ success: false, message: 'User could not be fully deleted' });
        }

        // Clean up from groups
        const groups = db.getAll('groups');
        groups.forEach(g => {
            if (g.members.includes(userId)) {
                g.members = g.members.filter(m => m !== userId);
                db.updateById('groups', g.id, { members: g.members });
            }
        });

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PATCH /api/admin/users/:id/password
router.patch('/users/:id/password', adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const user = db.getById('users', userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const bcrypt = require('bcryptjs');
        const hashed = await bcrypt.hash(newPassword, 12);

        db.updateById('users', userId, { password: hashed });

        res.status(200).json({ success: true, message: 'User password reset successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/admin/broadcast — Send notification to all users (admin only)
router.post('/broadcast', adminAuth, (req, res) => {
    try {
        const { title, description, imageUrl } = req.body;
        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        const allUsers = db.getAll('users');
        const notification = {
            id: uuidv4(),
            type: 'broadcast',
            title: title.trim(),
            message: description.trim(),
            imageUrl: imageUrl || null,
            senderName: 'SplitX',
            senderAvatar: '📢',
            senderId: 'admin',
            timestamp: new Date().toISOString(),
        };

        // Persist broadcast so users who come online later can fetch history
        db.insert('broadcast_notifications', notification);

        // Push live to all connected users
        const allUserIds = allUsers.map(u => u.id);
        sseService.sendToUsers(allUserIds, notification);

        res.status(201).json({ success: true, notification });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/admin/broadcasts — Get recent broadcast history
router.get('/broadcasts', adminAuth, (req, res) => {
    try {
        const all = db.getAll('broadcast_notifications');
        const recent = all.slice(-20).reverse();
        res.json({ success: true, broadcasts: recent });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/admin/broadcasts — Clear all broadcast notifications
router.delete('/broadcasts', adminAuth, (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const dataDir = path.resolve(process.env.DATA_DIR || './data');
        const fp = path.join(dataDir, 'broadcast_notifications.json');
        fs.writeFileSync(fp, JSON.stringify([]));
        res.json({ success: true, message: 'All broadcast notifications cleared' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
