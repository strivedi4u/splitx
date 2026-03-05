const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const sseService = require('../services/sseService');

const populateSettlement = (s) => {
    const allUsers = db.getAll('users');
    const allGroups = db.getAll('groups');
    const safeUser = (id) => { const u = allUsers.find(u => u.id === id); return u ? { id: u.id, name: u.name, avatar: u.avatar, color: u.color } : { id }; };
    const safeGroup = (id) => { const g = allGroups.find(g => g.id === id); return g ? { id: g.id, name: g.name, icon: g.icon } : { id }; };
    return { ...s, fromData: safeUser(s.from), toData: safeUser(s.to), groupData: safeGroup(s.groupId) };
};

// GET /api/settlements
exports.getSettlements = (req, res) => {
    try {
        const { groupId } = req.query;
        const myGroups = db.findMany('groups', g => g.members.includes(req.user.id)).map(g => g.id);

        let settlements;
        if (groupId) {
            if (!myGroups.includes(groupId))
                return res.status(403).json({ success: false, message: 'Not a member of this group' });
            settlements = db.findMany('settlements', s => s.groupId === groupId);
        } else {
            settlements = db.findMany('settlements', s => myGroups.includes(s.groupId));
        }

        settlements.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.status(200).json({ success: true, count: settlements.length, settlements: settlements.map(populateSettlement) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/settlements
exports.addSettlement = (req, res) => {
    try {
        const { groupId, from, to, amount, date, note } = req.body;
        if (!groupId || !from || !to || !amount)
            return res.status(400).json({ success: false, message: 'groupId, from, to, amount are required' });

        const group = db.getById('groups', groupId);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        if (!group.members.includes(req.user.id))
            return res.status(403).json({ success: false, message: 'Not a member of this group' });

        const settlement = {
            id: uuidv4(),
            groupId,
            from,
            to,
            amount: parseFloat(amount),
            date: date ? new Date(date).toISOString() : new Date().toISOString(),
            note: note || '',
            createdAt: new Date().toISOString(),
        };
        db.insert('settlements', settlement);

        const fromUser = db.getById('users', from);
        const toUser = db.getById('users', to);

        db.insert('activities', {
            id: uuidv4(),
            type: 'settlement',
            description: `${fromUser?.name || 'Someone'} paid ${toUser?.name || 'someone'}`,
            amount: parseFloat(amount),
            groupId,
            userId: req.user.id,
            relatedId: settlement.id,
            date: new Date().toISOString(),
        });

        // Notify all group members about the settlement
        sseService.sendToUsers(group.members, {
            type: 'settlement_made',
            title: 'Payment Made',
            message: `${fromUser?.name || 'Someone'} paid ${toUser?.name || 'someone'} ₹${parseFloat(amount).toFixed(2)} in "${group.name}"`,
            groupId,
            groupName: group.name,
            amount: parseFloat(amount),
            fromName: fromUser?.name || 'Someone',
            toName: toUser?.name || 'Someone',
            senderName: 'SplitX',
            senderAvatar: '🤝',
            timestamp: new Date().toISOString(),
        }, req.user.id);

        // Also send a personal notification directly to the recipient
        if (to !== req.user.id) {
            sseService.sendToUser(to, {
                type: 'settlement_received',
                title: 'You Received a Payment',
                message: `${fromUser?.name || 'Someone'} paid you ₹${parseFloat(amount).toFixed(2)} in "${group.name}"`,
                groupId,
                groupName: group.name,
                amount: parseFloat(amount),
                fromName: fromUser?.name || 'Someone',
                senderName: 'SplitX',
                senderAvatar: '💰',
                timestamp: new Date().toISOString(),
            });
        }

        res.status(201).json({ success: true, settlement: populateSettlement(settlement) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
