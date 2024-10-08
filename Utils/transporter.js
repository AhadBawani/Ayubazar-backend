const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        'user': 'admin@ayubazar.in',
        'pass': 'Ssh@Vps77'
    }
})

module.exports = transporter;