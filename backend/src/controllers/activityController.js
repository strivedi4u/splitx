const db = require('../config/db');

// GET /api/activities
exports.getActivities = (req, res) => {
    try {
        const { groupId, limit = 50, page = 1 } = req.query;
        const myGroups = db.findMany('groups', g => g.members.includes(req.user.id)).map(g => g.id);
        const allUsers = db.getAll('users');

        let activities;
        if (groupId) {
            if (!myGroups.includes(groupId))
                return res.status(403).json({ success: false, message: 'Not a member' });
            activities = db.findMany('activities', a => a.groupId === groupId);
        } else {
            activities = db.findMany('activities', a => myGroups.includes(a.groupId));
        }

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        const total = activities.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const paged = activities.slice(start, start + parseInt(limit));

        const allGroups = db.getAll('groups');
        const safeUser = (id) => { const u = allUsers.find(u => u.id === id); return u ? { id: u.id, name: u.name, avatar: u.avatar, color: u.color } : null; };
        const safeGroup = (id) => { const g = allGroups.find(g => g.id === id); return g ? { id: g.id, name: g.name, icon: g.icon } : null; };

        const populated = paged.map(a => ({
            ...a,
            userdata: safeUser(a.userId),
            groupData: safeGroup(a.groupId),
        }));

        res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            activities: populated,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
