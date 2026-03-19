import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import routes from "./routes/index.js";
import { setupCronJobs, runDueDateCheck } from "./due-date.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Socket.io Server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST"],
    },
});

// Database Connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {   // ✅ ADD async HERE
        console.log("DB Connected successfully.");

        await runDueDateCheck(io);  // ✅ Now await is allowed

        setupCronJobs(io);
    })
    .catch((err) => console.log("Failed to connect to DB:", err));

// API Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to TaskMate API" });
});

app.use("/api-v1", routes);

// Error Handling
app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({ message: "Internal server error" });
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