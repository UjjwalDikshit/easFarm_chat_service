const express = require('express');
const cors = require('cors');
require("dotenv").config();
const mongoose = require("mongoose");

const MongoDBConnect = require('./src/config/mongoDB');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Start Application
async function appStart() {
    try {
        await MongoDBConnect(); // wait for DB connection

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

appStart();