const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['expense', 'settlement', 'group_created', 'member_joined', 'member_left'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    amount: Number,
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // expense or settlement doc id
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
