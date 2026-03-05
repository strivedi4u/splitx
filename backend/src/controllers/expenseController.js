const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const sseService = require('../services/sseService');

const populateExpense = (exp) => {
    const allUsers = db.getAll('users');
    const allGroups = db.getAll('groups');
    const safeUser = (id) => { const u = allUsers.find(u => u.id === id); return u ? { id: u.id, name: u.name, avatar: u.avatar, color: u.color } : { id }; };
    const safeGroup = (id) => { const g = allGroups.find(g => g.id === id); return g ? { id: g.id, name: g.name, icon: g.icon } : { id }; };
    return {
        ...exp,
        paidByData: safeUser(exp.paidBy),
        splitBetweenData: (exp.splitBetween || []).map(safeUser),
        groupData: safeGroup(exp.groupId),
    };
};

// GET /api/expenses  (optionally ?groupId=xxx)
exports.getExpenses = (req, res) => {
    try {
        const { groupId } = req.query;
        const myGroups = db.findMany('groups', g => g.members.includes(req.user.id)).map(g => g.id);

        let expenses;
        if (groupId) {
            if (!myGroups.includes(groupId))
                return res.status(403).json({ success: false, message: 'Not a member of this group' });
            expenses = db.findMany('expenses', e => e.groupId === groupId);
        } else {
            expenses = db.findMany('expenses', e => myGroups.includes(e.groupId));
        }

        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.status(200).json({ success: true, count: expenses.length, expenses: expenses.map(populateExpense) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/expenses/:id
exports.getExpense = (req, res) => {
    try {
        const expense = db.getById('expenses', req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.status(200).json({ success: true, expense: populateExpense(expense) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/expenses
exports.addExpense = (req, res) => {
    try {
        const { description, amount, category, groupId, paidBy, splitBetween, splitType, date, imageUrls } = req.body;
        if (!description || !amount || !groupId || !paidBy || !splitBetween?.length)
            return res.status(400).json({ success: false, message: 'description, amount, groupId, paidBy, splitBetween are required' });

        const group = db.getById('groups', groupId);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        if (!group.members.includes(req.user.id))
            return res.status(403).json({ success: false, message: 'Not a member of this group' });

        const expense = {
            id: uuidv4(),
            description: description.trim(),
            amount: parseFloat(amount),
            category: category || 'general',
            groupId,
            paidBy,
            splitBetween,
            splitType: splitType || 'equal',
            date: date ? new Date(date).toISOString() : new Date().toISOString(),
            imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
            createdBy: req.user.id,
            createdAt: new Date().toISOString(),
        };
        db.insert('expenses', expense);

        db.insert('activities', {
            id: uuidv4(),
            type: 'expense',
            description: `Added expense "${description}"`,
            amount: parseFloat(amount),
            groupId,
            userId: req.user.id,
            relatedId: expense.id,
            date: new Date().toISOString(),
        });

        // Notify all group members except the one who added the expense
        const actor = db.getById('users', req.user.id);
        sseService.sendToUsers(group.members, {
            type: 'expense_added',
            title: 'New Expense Added',
            message: `${actor?.name || 'Someone'} added "${description}" (₹${parseFloat(amount).toFixed(2)}) in "${group.name}"`,
            groupId,
            groupName: group.name,
            amount: parseFloat(amount),
            actorName: actor?.name || 'Someone',
            senderName: 'SplitX',
            senderAvatar: '💰',
            timestamp: new Date().toISOString(),
        }, req.user.id);

        res.status(201).json({ success: true, expense: populateExpense(expense) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/expenses/:id
exports.deleteExpense = (req, res) => {
    try {
        const expense = db.getById('expenses', req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        if (expense.createdBy !== req.user.id && expense.paidBy !== req.user.id)
            return res.status(403).json({ success: false, message: 'Not authorized to delete this expense' });

        db.deleteById('expenses', req.params.id);
        res.status(200).json({ success: true, message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/expenses/:id
exports.updateExpense = (req, res) => {
    try {
        const expense = db.getById('expenses', req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

        // Only creator or payer can update
        if (expense.createdBy !== req.user.id && expense.paidBy !== req.user.id)
            return res.status(403).json({ success: false, message: 'Not authorized to update this expense' });

        const allowedUpdates = ['description', 'amount', 'category', 'date', 'imageUrls'];
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key) || key === 'images') {
                updates[key] = req.body[key];
            }
            if (key === 'amount') updates[key] = parseFloat(req.body[key]);
            if (key === 'date') updates[key] = new Date(req.body[key]).toISOString();
        });

        const updated = db.updateById('expenses', expense.id, updates);

        db.insert('activities', {
            id: uuidv4(),
            type: 'expense',
            description: `Updated expense "${updated.description}"`,
            amount: updated.amount,
            groupId: updated.groupId,
            userId: req.user.id,
            relatedId: updated.id,
            date: new Date().toISOString(),
        });

        res.status(200).json({ success: true, expense: populateExpense(updated) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/expenses/balances/:groupId
exports.getGroupBalances = (req, res) => {
    try {
        const { groupId } = req.params;
        const group = db.getById('groups', groupId);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        if (!group.members.includes(req.user.id))
            return res.status(403).json({ success: false, message: 'Not a member' });

        const expenses = db.findMany('expenses', e => e.groupId === groupId);
        const settlements = db.findMany('settlements', s => s.groupId === groupId);
        const allUsers = db.getAll('users');

        const balances = {};
        group.members.forEach(m => { balances[m] = 0; });

        expenses.forEach(exp => {
            const share = exp.amount / exp.splitBetween.length;
            exp.splitBetween.forEach(mId => {
                if (mId !== exp.paidBy) {
                    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + share;
                    balances[mId] = (balances[mId] || 0) - share;
                }
            });
        });

        settlements.forEach(s => {
            balances[s.from] = (balances[s.from] || 0) - s.amount;
            balances[s.to] = (balances[s.to] || 0) + s.amount;
        });

        const safeUser = (id) => { const u = allUsers.find(u => u.id === id); return u ? { id: u.id, name: u.name, avatar: u.avatar, color: u.color } : { id }; };
        const result = Object.entries(balances).map(([userId, balance]) => ({
            user: safeUser(userId),
            balance: Math.round(balance * 100) / 100,
        }));

        res.status(200).json({ success: true, balances: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/expenses/summary  — overall owed/owe for current user
exports.getMySummary = (req, res) => {
    try {
        const uid = req.user.id;
        const myGroups = db.findMany('groups', g => g.members.includes(uid)).map(g => g.id);
        const expenses = db.findMany('expenses', e => myGroups.includes(e.groupId));
        const settlements = db.findMany('settlements', s => myGroups.includes(s.groupId));

        const balances = {};
        expenses.forEach(exp => {
            const share = exp.amount / exp.splitBetween.length;
            exp.splitBetween.forEach(mId => {
                if (mId !== exp.paidBy) {
                    if (exp.paidBy === uid) balances[mId] = (balances[mId] || 0) + share;
                    else if (mId === uid) balances[exp.paidBy] = (balances[exp.paidBy] || 0) - share;
                }
            });
        });

        settlements.forEach(s => {
            if (s.to === uid) balances[s.from] = (balances[s.from] || 0) - s.amount;
            if (s.from === uid) balances[s.to] = (balances[s.to] || 0) + s.amount;
        });

        let totalOwed = 0, totalOwe = 0;
        Object.values(balances).forEach(v => {
            if (v > 0) totalOwed += v;
            else totalOwe += Math.abs(v);
        });

        res.status(200).json({
            success: true,
            summary: {
                totalOwed: Math.round(totalOwed * 100) / 100,
                totalOwe: Math.round(totalOwe * 100) / 100,
                netBalance: Math.round((totalOwed - totalOwe) * 100) / 100,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
