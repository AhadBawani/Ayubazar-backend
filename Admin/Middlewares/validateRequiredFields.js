const { validationResult } = require('express-validator');

const validateRequiredFields = (requiredFields) => {
    return (req, res, next) => {        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Required fields are missing: ${missingFields.join(', ')}` });
        }

        next();
    };
};

module.exports = validateRequiredFields;
