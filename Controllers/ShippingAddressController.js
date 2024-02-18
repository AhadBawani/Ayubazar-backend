const User = require('../Models/UserModel');
const ShippingAddress = require('../Models/ShippingAddressModel');

module.exports.ADD_SHIPPING_ADDRESS = async (req, res) => {
    const { firstName, lastName, phoneNumber, userId,
        email, streetAddress, apartment, city, postcode, state } = req.body;
    try {
        await ShippingAddress.findOne({ email: email })
            .exec()
            .then((shippingResponse) => {
                if (shippingResponse) {
                    const obj = {
                        firstName: firstName,
                        lastName: lastName,
                        phoneNumber: phoneNumber,
                        houseNumberAndStreetName: streetAddress,
                        apartment: apartment,
                        city: city,
                        postcode: postcode,
                        state: state,
                        email: email
                    }
                    console.log("Update obj : ", obj);
                    ShippingAddress.findOneAndUpdate({ userId: userId }, obj, { new: true })
                        .exec()
                        .then((updateResponse) => {
                            if (updateResponse) {
                                res.status(200).json({
                                    message: "Shipping address updated successfully!",
                                    ShippingAddress: updateResponse
                                })
                            }
                        })
                }
                else {
                    const newShippingAddress = new ShippingAddress({
                        userId: userId,
                        firstName: firstName,
                        lastName: lastName,
                        phoneNumber: phoneNumber,
                        houseNumberAndStreetName: streetAddress,
                        apartment: apartment,
                        city: city,
                        postcode: postcode,
                        state: state,
                        email: email,
                    }).save();

                    newShippingAddress
                        .then((address) => {
                            if (address) {
                                res.status(200).json({
                                    message: "Address added successfully!",
                                    address: address
                                })
                            }
                        })
                }
            })
    }
    catch (error) {
        console.log('error in add shipping address controller : ', error);
    }
}