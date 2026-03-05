const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Group name is required'],
        trim: true,
        minlength: 2,
        maxlength: 60,
    },
    icon: {
        type: String,
        default: '👥',
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    inviteCode: {
        type: String,
        unique: true,
        uppercase: true,
    },
}, { timestamps: true });

// Auto-generate invite code before saving
groupSchema.pre('save', function (next) {
    if (!this.inviteCode) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        this.inviteCode = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
    next();
});

module.exports = mongoose.model('Group', groupSchema);
