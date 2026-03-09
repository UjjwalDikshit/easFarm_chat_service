const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require("dotenv").config();
const mongoose = require("mongoose");
const create = require('./src/routes/creation')
const myThing = require('./src/routes/mything');

const http = require('http');
const MongoDBConnect = require('./src/config/mongoDB');
const {initSocket} = require('./src/config/socket');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/user", create);
app.use("/mything",myThing);

async function appStart() {
    try {
        await MongoDBConnect(); // wait for DB connection
        initSocket(server);

        server.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

appStart();