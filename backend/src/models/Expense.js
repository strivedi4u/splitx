const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: 200,
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be positive'],
    },
    category: {
        type: String,
        default: 'general',
        enum: ['food', 'transport', 'accommodation', 'entertainment', 'shopping', 'utilities', 'general', 'other'],
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    splitBetween: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    splitType: {
        type: String,
        enum: ['equal', 'custom'],
        default: 'equal',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
