const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
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
const BlogRoutes = require('./Admin/Routes/BlogRoutes');
const ContactUsRoutes = require('./Admin/Routes/ContactUsRoutes');
const CategoryRoutes = require('./Admin/Routes/CategoryRoutes');
const OrdersRoutes = require('./Routes/OrdersRoutes');
const OrdersAdminRoutes = require('./Admin/Routes/OrdersRoutes');
const ProductEnquiryRoutes = require('./Admin/Routes/ProductEnquiryRoutes');
const OrdersCancelReasonRoutes = require('./Admin/Routes/OrdersCancelReasonRoutes');
const PaymentRoutes = require('./Routes/PaymentRoutes');
const SubCategoryRoutes = require('./Admin/Routes/SubCategoryRoutes');
const scheduler = require('./Middlewares/scheduler');
require('dotenv/config');

dbConnection();
app.use(cors());
app.use('/company-images', express.static('Images/CompanyImages'));
app.use('/product-images', express.static('Images/ProductImages'));
app.use('/blog-images', express.static('Images/BlogImages'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
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
app.use('/blog', BlogRoutes);
app.use('/category', CategoryRoutes);
app.use('/contact', ContactUsRoutes);
app.use('/orders', OrdersRoutes);
app.use('/admin-orders', OrdersAdminRoutes);
app.use('/product-enquiry', ProductEnquiryRoutes);
app.use('/payment', PaymentRoutes);
app.use('/sub-category', SubCategoryRoutes);
app.use('/order-cancel-request', OrdersCancelReasonRoutes);

app.use('/', (req, res) => {
    res.send({
        message: "backend v10 running successfully!"
    })
})

const port = process.env.PORT || 5001;

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})
