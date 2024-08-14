const Users = require('../Models/UserModel');
const UserCart = require('../Models/UserCartModel');

module.exports.GET_USER_CART_BY_ID = async (req, res) => {
    const userId = req.params.userId;

    try {
        await Users.findById(userId)
            .exec()
            .then(async (userResponse) => {
                if (userResponse) {
                    await UserCart.find({ userId: userId }).select('_id userId productId option quantity')
                        .populate('productId')
                        .exec()
                        .then((userCartResponse) => {
                            const arr = [];
                            for (let i = 0; i < userCartResponse.length; i++) {
                                let obj = {
                                    _id: userCartResponse[i]._id,
                                    userId: userCartResponse[i].userId,
                                    product: userCartResponse[i].productId,
                                    option: userCartResponse[i].option,
                                    quantity: userCartResponse[i].quantity
                                }
                                arr.push(obj);
                            }
                            res.status(200).json(arr);
                        })
                } else {
                    res.status(404).send({
                        message: "User not found!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in getting user cart by id controller : ', error);
    }
}

module.exports.ADD_CART_QUANTITY = async (req, res) => {
    const { userId, cartId } = req.body;

    try {
        await Users.findById(userId)
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    UserCart.findByIdAndUpdate(cartId, { $inc: { 'quantity': 1 } }, { new: true })
                        .exec()
                        .then((updateResponse) => {
                            if (updateResponse) {
                                res.status(200).send({
                                    message: "Added quantity successfully!"
                                })
                            }
                        })
                }
                else {
                    res.status(400).send({
                        message: "Invalid Request!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in add quantity controller : ', error);
    }
}

module.exports.SUBTRACT_CART_QUANTITY = async (req, res) => {
    const { userId, cartId } = req.body;

    try {
        await Users.findById(userId)
            .exec()
            .then((userResponse) => {
                if (userResponse) {
                    UserCart.findByIdAndUpdate(cartId, { $inc: { 'quantity': -1 } }, { new: true })
                        .exec()
                        .then((userCartResponse) => {
                            if (userCartResponse) {
                                res.status(200).send({
                                    message: "removed quantity successfully!"
                                });
                            }
                        })
                } else {
                    res.status(400).send({
                        message: "Invalid Request!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in subtract quantity controller : ', error);
    }
}

module.exports.DELETE_USER_CART = async (req, res) => {
    const cartId = req.params.cartId;

    try {
        await UserCart.findByIdAndDelete(cartId)
            .exec()
            .then((userCartDeleteResponse) => {
                if (userCartDeleteResponse) {
                    res.status(200).send({
                        message: "Removed successfully!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in delete user cart controller : ', error);
    }
}

module.exports.ADD_USER_CART = async (req, res) => {
    const { userId, productId, option, quantity } = req.body;
    try {
        await UserCart.findOne({ userId: userId, productId: productId, option: option })
            .exec()
            .then((response) => {
                if (response) {
                    UserCart.findByIdAndUpdate(response._id, { $inc: { 'quantity': 1 } }, { new: true })
                        .exec()
                        .then((updateResponse) => {
                            if (updateResponse) {
                                res.status(200).send({
                                    message: "Added quantity successfully!"
                                })
                            }
                        })
                } else {
                    const userCart = new UserCart({
                        userId: userId,
                        productId: productId,
                        option: option,
                        quantity: quantity
                    }).save();

                    userCart
                        .then((addUserCartResponse) => {
                            if (addUserCartResponse) {
                                res.status(200).send({
                                    message: "Added to cart"
                                })
                            }
                        })
                }
            })
    }
    catch (error) {
        console.log('error in add user cart controller : ', error);
    }
}