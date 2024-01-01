const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dbConnection = require('./Utils/dbConnection');
const CompanyRoutes = require('./Admin/Routes/CompanyRoutes');
require('dotenv/config');

dbConnection();
app.use(cors());
app.use(bodyParser.json());

app.use('/company', CompanyRoutes);

app.use('/', (req, res) => {
    res.send({
        message: "backend v1 running successfully!"
    })
})

const port = process.env.PORT || 5001;

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})
