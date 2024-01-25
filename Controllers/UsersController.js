const User = require('../Models/UserModel');
const ShippingAddress = require('../Models/ShippingAddressModel');
const BillingAddress = require('../Models/BillingAddressModel');

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