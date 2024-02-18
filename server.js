const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dbConnection = require('./Utils/dbConnection');
const CompanyRoutes = require('./Admin/Routes/CompanyRoutes');
const ProductRoutes = require('./Admin/Routes/ProductsRoutes');
const UsersRoutes = require('./Routes/UsersRoutes');
const BillingAddressRoutes = require('./Routes/BillingAddressRoutes');
const UserCartRoutes = require('./Routes/UserCartRoutes');
const CouponRoutes = require('./Admin/Routes/CouponRoutes');
const ShippingAddressRoutes = require('./Routes/ShippingAddressRoutes');
const AdminUserRoutes = require('./Admin/Routes/AdminUserRoutes');
const OfferDiscountRoutes = require('./Admin/Routes/OfferDiscountRoutes');
const ProductReviewRoutes = require('./Routes/ProductReviewRoutes');
const scheduler = require('./Middlewares/scheduler');
require('dotenv/config');

dbConnection();
app.use(cors());
app.use('/company-images', express.static('Images/CompanyImages'));
app.use('/product-images', express.static('Images/ProductImages'));
app.use(bodyParser.json());
scheduler.start();
app.use('/company', CompanyRoutes);
app.use('/product', ProductRoutes);
app.use('/user', UsersRoutes);
app.use('/usercart', UserCartRoutes);
app.use('/billing-address', BillingAddressRoutes);
app.use('/shipping-address', ShippingAddressRoutes);
app.use('/coupon', CouponRoutes);
app.use('/review', ProductReviewRoutes);
app.use('/admin-user', AdminUserRoutes);
app.use('/offer', OfferDiscountRoutes);

app.use('/', (req, res) => {
    res.send({
        message: "backend v1 running successfully!"
    })
})

const port = process.env.PORT || 5001;

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})
