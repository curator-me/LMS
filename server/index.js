const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./database/connectDb");
const userRouter = require("./routes/user");
require("dotenv").config();

const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:5173"
}));

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", info: "Learning Management System is running..." });
});

app.use("/user", userRouter);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Learning Management System app listening on port ${port}`);
  });
}

module.exports = app;