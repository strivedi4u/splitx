const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const sseService = require('../services/sseService');
const { protect } = require('../middleware/auth');

/**
 * GET /api/notifications/subscribe
 * Establishes a Server-Sent Events (SSE) connection for real-time notifications.
 * Auth token is passed as ?token= query param because EventSource doesn't support
 * custom Authorization headers.
 */
router.get('/subscribe', (req, res) => {
    // Authenticate via query param token
    const token = req.query.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token required' });
    }

    let user;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = db.getById('users', decoded.id);
        if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering if behind proxy
    res.flushHeaders();

    // Register the client
    sseService.addClient(user.id, res);

    // Send an initial connected event
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notifications' })}\n\n`);

    // Send heartbeat every 25 seconds to keep connection alive
    const heartbeat = setInterval(() => {
        try {
            res.write(`: heartbeat\n\n`);
        } catch {
            clearInterval(heartbeat);
        }
    }, 25000);

    // Cleanup on client disconnect
    req.on('close', () => {
        clearInterval(heartbeat);
        sseService.removeClient(user.id);
        res.end();
    });
});

/**
 * GET /api/notifications/status
 * Debug endpoint to check how many SSE clients are connected.
 */
router.get('/status', (req, res) => {
    res.json({ connectedClients: sseService.getConnectedCount() });
});

/**
 * POST /api/notifications/broadcast
 * Send a notification to ALL users (live SSE push + persisted in DB).
 * Body: { title, description, imageUrl? }
 */
router.post('/broadcast', protect, (req, res) => {
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
        senderId: req.user.id,
        timestamp: new Date().toISOString(),
    };

    // Persist broadcast so users who come online later can fetch history
    db.insert('broadcast_notifications', notification);

    // Push live to all connected users except sender
    const allUserIds = allUsers.map(u => u.id);
    sseService.sendToUsers(allUserIds, notification, req.user.id);

    // Also send to sender so they see their own broadcast
    sseService.sendToUser(req.user.id, { ...notification, fromSelf: true });

    res.status(201).json({ success: true, notification });
});

/**
 * GET /api/notifications/broadcasts
 * Fetch the last 20 broadcast notifications (for users who were offline).
 */
router.get('/broadcasts', protect, (req, res) => {
    const all = db.getAll('broadcast_notifications');
    const recent = all.slice(-20).reverse();
    res.json({ success: true, notifications: recent });
});

module.exports = router;
