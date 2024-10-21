const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'cloud203.cloudwebhosting.com',
    port: 465,
    secure: true,    
    auth: {
        'user': 'admin@ayubazar.com',
        'pass': 'Ayubazar@60666'
    }
})

module.exports = transporter;