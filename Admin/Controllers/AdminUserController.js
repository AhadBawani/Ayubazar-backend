const User = require('../../Models/UserModel');
const jwt = require('jsonwebtoken');
const validateRequiredFields = require('../Middlewares/validateRequiredFields');
require('dotenv/config');

module.exports.ADMIN_USER_LOGIN = async (req, res) => {
    const { email, password } = req.body;
    try {
        await User.findOne({ email: email, password: password })
            .select('firstName lastName displayName email type')
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    if (userResponse.type === 'admin') {
                        const token = jwt.sign({
                            userId: userResponse._id,
                            role: userResponse.type
                        }
                            , process.env.JWT_SECRET,
                            { expiresIn: '1d' });

                        res.status(200).json({
                            user: userResponse,
                            token: token
                        });
                    } else {
                        return res.status(403).json({ message: 'Forbidden' });
                    }
                } else {
                    res.status(404).send({
                        message: "User not found!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in admin user login controller : ', error);
    }
}

module.exports.ADMIN_USER_SIGNUP = async (req, res) => {
    const { email, password, key } = req.body;
    try {
        await User.findOne({ email: email })
            .select('firstName lastName displayName email password type')
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    res.status(400).send({
                        message: "user already exists"
                    })
                } else {
                    if (key === process.env.ADMIN_KEY) {
                        const user = new User({
                            email: email,
                            password: password,
                            displayName: email.toString().split('@')[0],
                            type: 'admin'
                        }).save();

                        user
                            .then((userCreateResponse) => {
                                if (userCreateResponse) {
                                    const token = jwt.sign({
                                        userId: userCreateResponse._id,
                                        role: userCreateResponse.type
                                    }
                                        , process.env.JWT_SECRET,
                                        { expiresIn: '1d' });

                                    res.status(200).send({
                                        message: "user created successfully!",
                                        user: userCreateResponse,
                                        token: token
                                    })
                                }
                            })
                    } else {
                        res.status(400).send({
                            message: "Invalid key!"
                        })
                    }
                }
            })
    }
    catch (error) {
        console.log('error in user sign up controller : ', error);
    }
}

module.exports.VALIDATE_USER = async (req, res) => {
    const token = req.body.token;

    try {
        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Token is invalid
                return res.status(401).json({ message: 'Token Expired!' });
            } else {
                // Token is valid
                const userId = decoded.userId;
                User.findById(userId)
                .select('_id displayName email type')
                    .exec()
                    .then((userResponse) => {
                        if (userResponse) {
                            return res.status(200).json({
                                user:userResponse,
                                token:token
                            });
                        }
                        else {
                            return res.status(404).send({
                                message: "User not found!"
                            })
                        }
                    })

            }
        });
    } catch (error) {
        console.log('error in validate user controller : ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}