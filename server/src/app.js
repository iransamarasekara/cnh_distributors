const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const cors = require("cors");
const express = require("express");
const routes = require("./routes");
const db = require("./models"); // Sequelize models

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://cnh-distributors-client.onrender.com",
    ];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use("/api", routes);

// Sync database
db.sequelize.sync().then(() => {
  console.log("Database synced!");
});

module.exports = app;
