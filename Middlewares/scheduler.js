const cron = require('node-cron');
const OfferDiscount = require('../Models/OfferDiscountModel');
const Products = require('../Models/ProductsModel');

const checkAndUpdateExpiredStatus = async () => {
    const discount = await OfferDiscount.findOne({ expired: false });
    const currentTime = new Date();

    if (discount && currentTime >= discount.expiryDate) {
        discount.expired = true;
        for (let i = 0; i < discount.products.length; i++) {
            const product = await Products.findById(discount.products[i]);
            if (product) {
                const updatedOptions = JSON.parse(product.options)?.map((opt) => {
                    const price = parseFloat(opt.price);
                    const discountedPrice = Math.round(price + (price * parseInt(product?.discount)) / 100);
                    return { ...opt, price: discountedPrice.toString() };
                })
                await OfferDiscount.deleteMany({});
                await Products.findByIdAndUpdate(discount.products[i],
                    {
                        discount: null,
                        options: JSON.stringify(updatedOptions)
                    },
                    { new: true });
            }
        }
        await discount.save();

        console.log('Discount expired status updated successfully.');
    }
}

module.exports = {
    start: () => {
        cron.schedule('* * * * *', () => {
            checkAndUpdateExpiredStatus();
        });
    }
}
