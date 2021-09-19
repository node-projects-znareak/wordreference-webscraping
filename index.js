const morgan = require("morgan");
const express = require("express");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const { API } = require("./config/variables");
const startServer = require("./config/server");
const routers = require("./routers")

app.use(
  cors({
    methods: ["GET"],
    credentials: false,
    origin: "*",
  })
);
app.use(morgan("dev"));
app.use(helmet());
app.use(hpp());
app.use(rateLimit(API.RATE_LIMITS));

startServer(app, routers);
