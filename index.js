const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.SERVER_PORT;
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;


const UserRoute = require('./routes/UserRoute');
const UserController = require('./controllers/UserController');
const CampRoute = require('./routes/CampRoute');
const BloodInventoryRoute = require('./routes/BloodInventoryRoute');
const CampRegistrationRoute = require('./routes/CampRegistrationRoute');
const BloodIssueRoute = require('./routes/BloodIssueRoute');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());



app.use((req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'Authorization');
    next();
});

mongoose.connect(DB_CONNECTION_STRING)
    .then(async () => {
        try {
            await UserController.initializeAdmin();
        } catch (error) {
            console.error("Failed to initialize admin, but continuing startup:", error);
        }
        app.listen(PORT, () => {
            console.log(`API started and running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error("Failed to connect to MongoDB:", error);
    });


app.use('/api/v1/users', UserRoute);
app.use('/api/v1/camps', CampRoute);
app.use('/api/v1/blood-inventory', BloodInventoryRoute);
app.use('/api/v1/camp-registrations', CampRegistrationRoute);
app.use('/api/v1/blood-issues', BloodIssueRoute);



module.exports = app;