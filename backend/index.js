import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import morgan from "morgan"
import http from "http";
import { Server } from "socket.io";
import routes from "./routes/index.js"
import { dueDateReminderJob } from "./due-date.js"
import path from "path";

dotenv.config()

const app = express()

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,   // ✅ REQUIRED
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(morgan("dev"));

// db connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("DB Connected successfully."))
    .catch((err) => console.log("Failed to connect to DB:", err));
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("DB Connected successfully.");
        dueDateReminderJob(); // 🔥 start cron after DB is ready
    })
    .catch((err) => console.log("Failed to connect to DB:", err));

app.use(express.json())

const PORT = process.env.PORT || 5000;

app.use("/uploads", express.static("uploads"));

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);

app.get("/", async (req, res) => {
    res.status(200).json({
        message: "Welcome to TaskMate API",
    });
});

//http:localhost:500/api-v1/
app.use("/api-v1", routes);


// error middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

// not found middleware
app.use((req, res) => {
    res.status(404).json({
        message: "Not found",
    });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST"],
    },
});
io.on("connection", (socket) => {
    console.log("🔔 User connected:", socket.id);

    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined notification room`);
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
export { io };
