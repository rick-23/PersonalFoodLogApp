const jwt = require('jsonwebtoken');

/** Requires "Authorization: Bearer <token>" and sets req.userId. */
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) return res.status(401).json({ message: 'Invalid or expired token' });
        req.userId = payload.userId;
        next();
    });
}

module.exports = authenticateToken;
