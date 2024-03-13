const BillingAddress = require('../Models/BillingAddressModel');

module.exports.ADD_BILLINGADDRESS = async (req, res) => {
    const { firstName, lastName, phoneNumber, streetAddress, userId,
        apartment, city, postcode, state, email } = req.body;
    try {
        await BillingAddress.findOne({ userId: userId })
            .exec()
            .then((response) => {
                if (response) {
                    const obj = {
                        firstName: firstName,
                        lastName: lastName,
                        phoneNumber: phoneNumber,
                        streetAddress: streetAddress,
                        apartment: apartment,
                        city: city,
                        postcode: postcode,
                        state: state,
                        email: email
                    }
                    BillingAddress.findOneAndUpdate({ userId: userId }, obj, { new: true })
                        .exec()
                        .then((billingResponse) => {
                            if (billingResponse) {
                                res.status(200).json({
                                    message: "Billing address updated successfully!",
                                    billingAddress: billingResponse
                                })
                            }
                        })
                }
                else {
                    const newBillingAddress = new BillingAddress({
                        userId: userId,
                        firstName: firstName,
                        lastName: lastName,
                        phoneNumber: phoneNumber,
                        streetAddress: streetAddress,
                        apartment: apartment,
                        city: city,
                        postcode: postcode,
                        state: state,
                        email: email
                    }).save();

                    newBillingAddress
                        .then((address) => {
                            if (address) {
                                res.status(200).json({
                                    message: "Address added successfully!",
                                    billingAddress: address
                                })
                            }
                        })
                }
            })
    }
    catch (error) {
        console.log(error);
    }
}