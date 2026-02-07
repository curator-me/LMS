import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./database/connectDb.js";
import userRouter from "./routes/user.js";
import courseRouter from "./routes/course.js";
import adminRouter from "./routes/admin.js";


const app = express();
const port = 8000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  })

);

app.use("/storage", express.static("storage"));


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
    app.use("/course", courseRouter);
    app.use("/admin", adminRouter);


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

export default app;
