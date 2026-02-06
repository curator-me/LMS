const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./database/connectDb");
const userRouter = require("./routes/user");

const app = express();
const port = 8000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

async function startServer() {
  try {
    await connectDB();
    
    app.get("/", (req, res) => {
      res.status(200).json({
        status: "OK",
        info: "Learning Management System is running...",
      });
    });

    app.use("/user", userRouter);

    if (process.env.NODE_ENV !== "test") {
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
