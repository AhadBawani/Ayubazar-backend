const Coupons = require('../../Models/CouponModel');

module.exports.GENERATE_COUPON = async (req, res) => {
    const { coupon, percentage, canUse } = req.body;
    try {
        await Coupons.findOne({ coupon: coupon })
            .exec()
            .then((response) => {
                if (response) {
                    res.status(409).send({
                        message: "Same name coupon already exists!"
                    })
                } else {
                    const newCoupon = new Coupons({
                        coupon: coupon,
                        percentage: percentage,
                        canUse: canUse,
                        alreadyUsed: 0
                    }).save();

                    newCoupon
                        .then((response) => {
                            if (response) {
                                res.status(200).send({
                                    message: 'Coupon generated successfully!',
                                    coupon: response
                                })
                            }
                        })
                }
            })
    }
    catch (error) {
        console.log('error in generating coupon controller : ', error);
    }
}

module.exports.VALIDATE_COUPON = async (req, res) => {
    const coupon = req.body.coupon;    
    try {
        await Coupons.findOne({ coupon: coupon })
            .select('coupon percentage canUse')
            .exec()
            .then((couponResponse) => {
                if (couponResponse) {
                    res.status(200).json(couponResponse)
                } else {
                    res.status(200).send({
                        message: "Invalid Coupon!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in validate coupon controller : ', error);
    }
}

module.exports.GET_ALL_COUPONS = async (req, res) => {
    try {
        await Coupons.find()
            .exec()
            .then((response) => {
                res.status(200).json(response);
            })
    }
    catch (error) {
        console.log('error in getting all coupons : ', error);
    }
}

module.exports.EDIT_COUPON = async (req, res) => {
    const { coupon, percentage, canUse } = req.body;
    const couponId = req.params.couponId;
    try {
        await Coupons.findByIdAndUpdate(couponId, { coupon: coupon, percentage: percentage, canUse: canUse })
            .exec()
            .then((editResponse) => {
                if (editResponse) {
                    res.status(200).send({
                        message: "edit coupon successfully!",
                        coupon: editResponse
                    })
                }
            })
    }
    catch (error) {
        console.log('error in edit coupon controller : ', error);
    }
}

module.exports.DELETE_COUPON = async (req, res) => {
    const couponId = req.params.couponId;
    try {
        await Coupons.findByIdAndDelete(couponId)
            .exec()
            .then((deleteResponse) => {
                if(deleteResponse){
                    res.status(200).send({
                        message : "coupon deleted successfully!"
                    })
                }
            })
    }
    catch (error) {
        console.log('error in delete coupon controller : ', error);
    }
}