/**
 * SSE (Server-Sent Events) Service
 * Manages persistent SSE connections per user and broadcasts notifications.
 */

// Map: userId -> SSE response object
const clients = new Map();

/**
 * Register an SSE client for a user.
 */
exports.addClient = (userId, res) => {
    clients.set(userId, res);
    console.log(`[SSE] Client connected: ${userId} (total: ${clients.size})`);
};

/**
 * Remove an SSE client when they disconnect.
 */
exports.removeClient = (userId) => {
    clients.delete(userId);
    console.log(`[SSE] Client disconnected: ${userId} (total: ${clients.size})`);
};

/**
 * Send a notification event to a single user.
 */
exports.sendToUser = (userId, notification) => {
    const client = clients.get(userId);
    if (client) {
        try {
            client.write(`data: ${JSON.stringify(notification)}\n\n`);
        } catch (err) {
            console.error(`[SSE] Failed to send to ${userId}:`, err.message);
            exports.removeClient(userId);
        }
    }
};

/**
 * Send a notification event to multiple users, excluding the actor.
 */
exports.sendToUsers = (userIds, notification, excludeUserId = null) => {
    userIds.forEach((uid) => {
        if (uid !== excludeUserId) {
            exports.sendToUser(uid, notification);
        }
    });
};

/**
 * Check how many users are currently connected (for debugging).
 */
exports.getConnectedCount = () => clients.size;
