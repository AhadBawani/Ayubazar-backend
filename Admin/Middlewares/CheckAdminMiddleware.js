const checkAdmin = (req, res, next) => {    
    if (req.user.type !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

module.exports = checkAdmin;