const ProductEnquiry = require('../../Models/ProductEnquiryModel');

module.exports.ADD_PRODUCT_ENQUIRY = async (req, res) => {
     const { name, email, phoneNumber, message } = req.body;
     try {
          const productEnquiry = new ProductEnquiry({
               name: name,
               email: email,
               phoneNumber: phoneNumber,
               message: message
          }).save();
          productEnquiry
               .then((response) => {
                    res.status(201).json({
                         message: "Product enquiry submitted successfully!",
                         productEnquiry: {
                              name: response.name,
                              email: response.email,
                              phoneNumber: response.phoneNumber,
                              message: response.message
                         }
                    })
               })
     }
     catch (error) {
          console.log('error in add product enquiry controller : ', error);
     }
}