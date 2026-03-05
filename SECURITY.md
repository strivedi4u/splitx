# 🔒 Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## 🛡️ Reporting a Vulnerability

We take security seriously at SplitX. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public issue
2. **Email**: Send details to the maintainer via [GitHub](https://github.com/strivedi4u)
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment** within 48 hours
- **Assessment** within 1 week
- **Fix timeline** communicated after assessment
- **Credit** given in release notes (unless you prefer anonymity)

## 🔐 Security Measures in SplitX

| Layer | Protection |
|-------|-----------|
| **Authentication** | JWT tokens with configurable expiry |
| **Passwords** | bcrypt hashing with salt rounds |
| **HTTP Headers** | Helmet.js security headers |
| **Rate Limiting** | 300 requests per 15 minutes per IP |
| **CORS** | Configurable origin restrictions |
| **Input Validation** | Server-side validation on all endpoints |
| **File Uploads** | Type checking, size limits (5 files max) |

## 📋 Best Practices for Deployment

- Set a strong `JWT_SECRET` (32+ characters, random)
- Use HTTPS in production
- Set `NODE_ENV=production`
- Configure CORS to allow only your frontend domain
- Regularly update dependencies (`npm audit`)
- Keep `ADMIN_TOKEN` secret and rotate periodically

## 🏆 Hall of Fame

We appreciate security researchers who help keep SplitX safe:

*Be the first to report a vulnerability and get listed here!*
