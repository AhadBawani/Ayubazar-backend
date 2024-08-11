const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        'user':'ahadbawani123@gmail.com',
        'pass':'iawe sjub jjyg nven'
    }
})

module.exports = transporter;