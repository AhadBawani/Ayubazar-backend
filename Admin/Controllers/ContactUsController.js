const ContactUs = require('../../Models/ContactUsModel');

module.exports.ADD_CONTACT_US = async (req, res) => {
    const { name, phoneNumber, email, city, state, message } = req.body;
    try {
        const contactUs = new ContactUs({
            name: name,
            phoneNumber: phoneNumber,
            email: email,
            city: city,
            state: state,
            message: message
        }).save();

        contactUs
            .then((response) => {
                if (response) {
                    res.status(201).json({
                        message: "Contact added successfully!",
                        contact: response
                    })
                }
            })
    }
    catch (error) {
        console.log('error in add contact us controller : ', error);
    }
}

module.exports.GET_ALL_CONTACT_US = async (req, res) => {
    try {
        await ContactUs.find({})
            .exec()
            .then((response) => {
                if (response) {
                    res.status(200).json(response);
                }
            })
    }
    catch (error) {
        console.log('error in getting all the contact us controller : ', error);
    }
}