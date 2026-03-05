require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route imports
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ── Static Admin Dashboard ──────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));

// static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// static files for APK downloads
const downloadsDir = path.join(__dirname, '../downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
app.use('/downloads', express.static(downloadsDir));

// ── Security & Middleware ──────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline styles/scripts for landing page & admin
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: '*', // Allow all origins for Azure deployment flexibility
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'tiny'));

// Rate limiting
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { success: false, message: 'Too many requests, please try again later' },
}));

// ── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SplitX API is running',
        storage: 'JSON files',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// ── App Version Check (for in-app update popup) ─────────
app.get('/api/version', (req, res) => {
    try {
        const versionFile = path.join(__dirname, '../data/app_version.json');
        if (!fs.existsSync(versionFile)) {
            return res.json({ latest: '1.0.0', minSupported: '1.0.0', forceUpdate: false, downloadUrl: '/downloads/splitx.apk', websiteUrl: '/', releaseNotes: '' });
        }
        const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to read version info' });
    }
});

// ── API Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Image Upload Endpoint
app.post('/api/upload', upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }

        // Return array of relative URLs
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        res.status(200).json({ success: true, imageUrls });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
    }
});

// ── API Docs ─────────────────────────────────────────────
app.get('/api', (req, res) => {
    res.status(200).json({
        name: 'SplitX Backend API',
        storage: 'JSON files (no database required)',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/signup': 'Register a new user',
                'POST /api/auth/login': 'Login — returns JWT token',
                'GET  /api/auth/me': 'Get current user [AUTH]',
                'PATCH /api/auth/profile': 'Update name/avatar/color [AUTH]',
                'PATCH /api/auth/change-password': 'Change password [AUTH]',
            },
            groups: {
                'GET    /api/groups': 'My groups [AUTH]',
                'POST   /api/groups': 'Create group [AUTH]',
                'POST   /api/groups/join': 'Join by invite code [AUTH]',
                'GET    /api/groups/:id': 'Group details [AUTH]',
                'PATCH  /api/groups/:id': 'Update group [AUTH]',
                'DELETE /api/groups/:id/leave': 'Leave group [AUTH]',
                'GET    /api/groups/:id/invite-code': 'Get invite code [AUTH]',
            },
            expenses: {
                'GET    /api/expenses': 'All my expenses or by ?groupId [AUTH]',
                'POST   /api/expenses': 'Add expense [AUTH]',
                'GET    /api/expenses/summary': 'Total owed/owe/net balance [AUTH]',
                'GET    /api/expenses/balances/:groupId': 'Group balance breakdown [AUTH]',
                'GET    /api/expenses/:id': 'Single expense [AUTH]',
                'DELETE /api/expenses/:id': 'Delete expense [AUTH]',
            },
            settlements: {
                'GET  /api/settlements': 'All settlements or by ?groupId [AUTH]',
                'POST /api/settlements': 'Record a settlement [AUTH]',
            },
            activities: {
                'GET  /api/activities': 'Activity feed (?groupId, ?page, ?limit) [AUTH]',
            },
            users: {
                'GET  /api/users/search?email=': 'Search users [AUTH]',
                'GET  /api/users/:id': 'Get user by ID [AUTH]',
            },
        },
    });
});

// ── 404 Handler ──────────────────────────────────────────
app.all('*', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
    console.error('🔴 Error:', err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});


// Export the app for use in index.js
module.exports = app;
