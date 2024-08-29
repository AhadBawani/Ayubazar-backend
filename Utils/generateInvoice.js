const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const Coupon = require('../Models/CouponModel');
const formatDate = require('./formatDate');

async function generateInvoice(orderData, shippingAddress) {
     const products = JSON.parse(orderData?.products);
     const pdfDoc = await PDFDocument.create();
     const page = pdfDoc.addPage([600, 700]);
     const { width, height } = page.getSize();
     const fontSize = 12;

     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
     const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

     let y = height - 50;

     // Title
     page.drawText('Invoice', {
          x: 50,
          y,
          size: 24,
          font: titleFont,
          color: rgb(0, 0, 0),
     });

     y -= 40;

     // Order details
     page.drawText(`Order ID: ${orderData.orderId}`, { x: 50, y, size: fontSize, font });
     y -= 20;
     page.drawText(`Date: ${formatDate(orderData.createdAt)}`, { x: 50, y, size: fontSize, font });
     y -= 20;
     page.drawText(`Status: ${orderData.status}`, { x: 50, y, size: fontSize, font });
     y -= 40;

     // Product section
     page.drawText('Products:', { x: 50, y, size: 18, font: titleFont });
     y -= 30;

     let originalSubTotal = 0;

     products.map(product => {
          const productName = product?.product?.productName;
          const quantity = product?.quantity;
          const price = product?.product?.isVariationAvailable
               ? Object.values(product?.option)[0]
               : product?.product?.salesPrice;

          const productTotal = price * quantity;
          originalSubTotal += productTotal;

          page.drawText(`${productName} - ${quantity} x ${price}`, {
               x: 50,
               y,
               size: fontSize,
               font,
          });
          y -= 20;
     });

     y -= 20;  // Add some spacing before subtotal

     // Subtotal
     page.drawText(`Subtotal: ${originalSubTotal.toFixed(2)}`, {
          x: 50,
          y,
          size: fontSize,
          font: titleFont,
     });

     y -= 30;  // Add some spacing after subtotal

     // Additional Charges and Discounts
     let discountAmount = 0;
     if (orderData.coupon) {
          const coupon = await Coupon.findById(orderData.coupon);
          if (coupon) {
               const discountPercentage = coupon.percentage;
               discountAmount = (originalSubTotal * discountPercentage) / 100;
               page.drawText(`Coupon Discount (${discountPercentage}%): -${discountAmount.toFixed(2)}`, {
                    x: 50,
                    y,
                    size: fontSize,
                    font,
               });
               y -= 20;
          }
     }

     if (orderData.codCharges > 0) {
          page.drawText(`COD Charges: ${orderData.codCharges}`, { x: 50, y, size: fontSize, font });
          y -= 20;
     }

     if (parseInt(orderData.shipping) > 0) {
          page.drawText(`Shipping: ${orderData.shipping}`, { x: 50, y, size: fontSize, font });
          y -= 20;
     }

     // Final Total
     y -= 30;  // Add some spacing before final total
     page.drawText(`Total: ${(orderData.total).toFixed(2)}`, {
          x: 50,
          y,
          size: 18,
          font: titleFont,
     });

     y -= 40;

     // Shipping Address
     page.drawText('Shipping Address:', { x: 50, y, size: 18, font: titleFont });
     y -= 30;

     page.drawText(`${shippingAddress?.firstName} ${shippingAddress?.lastName}`, { x: 50, y, size: fontSize, font });
     y -= 20;
     page.drawText(`Phone Number: ${shippingAddress?.phoneNumber}`, { x: 50, y, size: fontSize, font });
     y -= 20;
     page.drawText(`Email: ${shippingAddress?.email}`, { x: 50, y, size: fontSize, font });
     y -= 20;
     page.drawText(`Address: ${shippingAddress?.apartment} ${shippingAddress?.houseNumberAndStreetName}, ${shippingAddress?.state} ${shippingAddress?.city}, ${shippingAddress?.postcode}`, { x: 50, y, size: fontSize, font });

     const pdfBytes = await pdfDoc.save();
     return pdfBytes;
}

module.exports = generateInvoice;