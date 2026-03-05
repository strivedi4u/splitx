const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const sseService = require('../services/sseService');

const genCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const populateGroup = (group) => {
    const allUsers = db.getAll('users');
    const safeUser = (u) => u ? { id: u.id, name: u.name, email: u.email, avatar: u.avatar, color: u.color } : null;
    return {
        ...group,
        membersData: group.members.map(id => safeUser(allUsers.find(u => u.id === id))).filter(Boolean),
        createdByData: safeUser(allUsers.find(u => u.id === group.createdBy)),
    };
};

// GET /api/groups
exports.getMyGroups = (req, res) => {
    try {
        const groups = db.findMany('groups', g => g.members.includes(req.user.id));
        res.status(200).json({ success: true, count: groups.length, groups: groups.map(populateGroup) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/groups/:id
exports.getGroup = (req, res) => {
    try {
        const group = db.getById('groups', req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        if (!group.members.includes(req.user.id))
            return res.status(403).json({ success: false, message: 'Not a member of this group' });
        res.status(200).json({ success: true, group: populateGroup(group) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/groups
exports.createGroup = (req, res) => {
    try {
        const { name, icon } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Group name is required' });

        const group = {
            id: uuidv4(),
            name: name.trim(),
            icon: icon || '👥',
            members: [req.user.id],
            createdBy: req.user.id,
            inviteCode: genCode(),
            createdAt: new Date().toISOString(),
        };
        db.insert('groups', group);

        db.insert('activities', {
            id: uuidv4(),
            type: 'group_created',
            description: `Created group "${group.name}"`,
            groupId: group.id,
            userId: req.user.id,
            date: new Date().toISOString(),
        });

        res.status(201).json({ success: true, group: populateGroup(group), inviteCode: group.inviteCode });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/groups/join
exports.joinGroup = (req, res) => {
    try {
        const { inviteCode } = req.body;
        if (!inviteCode) return res.status(400).json({ success: false, message: 'Invite code is required' });

        const group = db.findOne('groups', g => g.inviteCode === inviteCode.toUpperCase().trim());
        if (!group) return res.status(404).json({ success: false, message: 'Invalid invite code' });
        if (group.members.includes(req.user.id))
            return res.status(400).json({ success: false, message: 'Already in this group' });

        const updated = db.updateById('groups', group.id, { members: [...group.members, req.user.id] });

        db.insert('activities', {
            id: uuidv4(),
            type: 'member_joined',
            description: `Joined group "${group.name}"`,
            groupId: group.id,
            userId: req.user.id,
            date: new Date().toISOString(),
        });

        // Notify existing group members that someone joined
        const joiner = db.getById('users', req.user.id);
        sseService.sendToUsers(group.members, {
            type: 'member_joined',
            title: 'New Member Joined',
            message: `${joiner?.name || 'Someone'} joined "${group.name}"`,
            groupId: group.id,
            groupName: group.name,
            actorName: joiner?.name || 'Someone',
            senderName: 'SplitX',
            senderAvatar: '👥',
            timestamp: new Date().toISOString(),
        }, req.user.id);

        res.status(200).json({ success: true, group: populateGroup(updated) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/groups/:id/leave
exports.leaveGroup = (req, res) => {
    try {
        const group = db.getById('groups', req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        if (!group.members.includes(req.user.id))
            return res.status(400).json({ success: false, message: 'Not in this group' });

        const newMembers = group.members.filter(m => m !== req.user.id);
        if (newMembers.length === 0) {
            db.deleteById('groups', group.id);
        } else {
            db.updateById('groups', group.id, { members: newMembers });
        }
        res.status(200).json({ success: true, message: 'Left the group successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/groups/:id/invite-code
exports.getInviteCode = (req, res) => {
    try {
        const group = db.getById('groups', req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        if (!group.members.includes(req.user.id))
            return res.status(403).json({ success: false, message: 'Not a member' });
        res.status(200).json({ success: true, inviteCode: group.inviteCode, groupName: group.name });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/groups/:id
exports.updateGroup = (req, res) => {
    try {
        const group = db.getById('groups', req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        if (group.createdBy !== req.user.id)
            return res.status(403).json({ success: false, message: 'Only the creator can update this group' });

        const { name, icon } = req.body;
        const updates = {};
        if (name) updates.name = name.trim();
        if (icon) updates.icon = icon;

        const updated = db.updateById('groups', group.id, updates);
        res.status(200).json({ success: true, group: populateGroup(updated) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
