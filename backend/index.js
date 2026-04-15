const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const create = require("./src/routes/creation");
const myThing = require("./src/routes/mything");
const validUser = require("./src/routes/validUser");
const {client,pub,sub} = require('./src/config/redis');
const http = require("http");
const MongoDBConnect = require("./src/config/mongoDB");
const { initSocket } = require("./src/config/socket");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  }),
);

app.use("/authenticate", validUser);
app.use("/user", create);
app.use("/mything", myThing);

async function appStart() {
  try {
    // Correcting the syntax to use Promise.all([])
    await Promise.all([MongoDBConnect(), client.connect(), pub.connect(),sub.connect()]);
    console.log("All databases are connected and ready!");

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
