const jwt = require('jsonwebtoken');
const Users = require('../../Models/UserModel');
require('dotenv/config');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        Users.findById(decoded?.userId)
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    req.user = userResponse;
                    next();
                }
            })
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = authMiddleware;