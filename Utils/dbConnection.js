const mongoose = require('mongoose');
require('dotenv/config');

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION);
        console.log(`Mongo DB Connected`);
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = dbConnection;
