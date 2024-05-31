const User = require('../Models/UserModel');
const ShippingAddress = require('../Models/ShippingAddressModel');
const BillingAddress = require('../Models/BillingAddressModel');
const transporter = require('../Utils/transporter');
const jwt = require('jsonwebtoken');
const generateRandomPassword = require('../Utils/generatePassword');
require('dotenv/config');

module.exports.LOGIN_USER = async (req, res) => {
    const { email, password } = req.body;
    try {
        await User.findOne({ email: email })
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    if (userResponse.password === password) {
                        ShippingAddress.findOne({ userId: userResponse._id })
                            .exec()
                            .then((shippingResponse) => {
                                BillingAddress.findOne({ userId: userResponse._id })
                                    .exec()
                                    .then((billingResponse) => {
                                        const user = {
                                            _id: userResponse._id,
                                            displayName: userResponse.displayName,
                                            firstName: userResponse.firstName,
                                            lastName: userResponse.lastName,
                                            email: userResponse.email,
                                            password: userResponse.password,
                                            shippingAddress: shippingResponse,
                                            billingAddress: billingResponse
                                        }
                                        res.status(200).json(user);
                                    })
                            })
                    }
                    else {
                        res.status(400).send({
                            message: "Incorrect Password!"
                        })
                    }
                }
                else {
                    res.status(404).send({
                        message: "User not found!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in login user controller : ', error);
    }
}

module.exports.SIGNUP_USER = async (req, res) => {
    const { email, displayName, password } = req.body;
    try {
        await User.findOne({ email: email })
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    res.status(409).send({
                        message: "User email already exists!"
                    })
                }
                else {
                    const user = new User({
                        email: email,
                        displayName: displayName,
                        billingAddress: null,
                        shippingAddress: null,
                        password: password
                    }).save();

                    user
                        .then((response) => {
                            res.status(201).send({
                                message: "User created successfully!",
                                user: response
                            })
                        })
                }
            })
    }
    catch (error) {
        console.log('error in signup user controller : ', error);
    }
}

module.exports.GET_USER_BY_ID = async (req, res) => {
    const userId = req.params.userId;

    try {
        await User.findById(userId)
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    ShippingAddress.findOne({ userId: userResponse._id })
                        .exec()
                        .then((shippingResponse) => {
                            BillingAddress.findOne({ userId: userResponse._id })
                                .exec()
                                .then((billingResponse) => {
                                    const user = {
                                        _id: userResponse._id,
                                        displayName: userResponse.displayName,
                                        firstName: userResponse.firstName,
                                        lastName: userResponse.lastName,
                                        email: userResponse.email,
                                        password: userResponse.password,
                                        shippingAddress: shippingResponse,
                                        billingAddress: billingResponse
                                    }
                                    res.status(200).json(user);
                                })
                        })
                }
            })
    }
    catch (error) {
        console.log('error in getting user id controller : ', error);
    }
}

module.exports.EDIT_USER = async (req, res) => {
    const userId = req.params.userId;
    try {
        await User.findById(userId)
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    User.findByIdAndUpdate(userId, req.body, { new: true })
                        .exec()
                        .then((updateResponse) => {
                            if (updateResponse) {
                                res.status(200).send({
                                    message: "Updated Successfully!",
                                    user: updateResponse
                                })
                            }
                        })
                } else {
                    res.status(404).send({
                        message: "User not found!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in editing user controller : ', error);
    }
}

module.exports.FORGOT_PASSWORD = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: '5m',
        });

        const resetLink = `http://localhost:3000/reset-password/${token}`;

        const mailOptions = {
            from: 'ahadbawani123@gmail.com',
            to: email,
            subject: 'Password Reset',
            html: `
              <p>You have requested to reset your password.</p>
              <p>
                <a href="${resetLink}" style="background-color: #027148; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">Reset Password</a>
              </p>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error);
                return res.status(500).json({ message: 'Failed to send email' });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Password reset link sent to your email' });
        });
    }
    catch (error) {
        console.log('error in forgot password controller : ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports.VERIFY_TOKEN = async (req, res) => {
    const { token } = req.params;

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        // Token is valid
        res.status(200).json({ message: 'Token is valid', decode });
    })
}

module.exports.RESET_PASSWORD = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findOne({ email: decoded.email })
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    User.findByIdAndUpdate(userResponse._id, { password: newPassword }, { new: true })
                        .exec()
                        .then((updateResponse) => {
                            if (updateResponse) {
                                res.status(200).send({
                                    message: "Password updated successfully!",
                                    response: updateResponse
                                })
                            }
                        })
                } else {
                    res.status(404).send({ message: "User not found" });
                }
            })
    }
    catch (error) {
        console.log('error in reset password controller : ', error);
    }
}

module.exports.GET_USER_BY_EMAIL = async (req, res) => {
    const { email } = req.body;

    try {
        await User.findOne({ email: email })
            .exec()
            .then(async (userResponse) => {
                if (userResponse) {
                    res.status(200).json(userResponse);
                } else {
                    const displayName = email.toString().split('@');
                    const newUser = new User({
                        email: email,
                        password: generateRandomPassword(),
                        displayName: displayName[0]
                    }).save();

                    newUser
                        .then((newUserResponse) => {
                            if (newUserResponse) {
                                res.status(200).json(newUserResponse);
                            }
                        })
                }
            })
    }
    catch (error) {
        console.log('error in getting user by email : ', error);
    }
}

module.exports.GET_USER_BY_EMAIL_IF_EXIST = async (req, res) => {
    const { email } = req.body;
    try {
        await User.findOne({ email: email })
            .exec()
            .then((response) => {
                if (response) {
                    res.status(200).json(response);
                } else {
                    res.status(200).json(null);
                }
            })
    }
    catch (error) {
        console.log('error in getting user by email : ', error);
    }
}