
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import mongoose from "mongoose";
// In-memory SSE connections
// In-memory SSE connections
const connections = {}; // userId -> [res1, res2, ...]

export const sseController = (req, res) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(401).end();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("Access-Control-Allow-Origin", "*");

        // Save multiple connections per user
        if (!connections[userId]) connections[userId] = [];
        connections[userId].push(res);

        console.log("SSE Connected:", userId);

        res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

        req.on("close", () => {
            connections[userId] = connections[userId]?.filter((c) => c !== res);
            if (!connections[userId]?.length) delete connections[userId];
            console.log("SSE Disconnected:", userId);
        });
    } catch (err) {
        console.error("SSE auth failed", err.message);
        return res.status(401).end();
    }
};


// Send a text message

export const sendMessage = async (req, res) => {
    try {
        const { to_user_id, text } = req.body;
        const from_user_id = req.body.userId;

        const newMessage = new Message({
            from_user_id,
            to_user_id,
            text,
        });
        await newMessage.save();

        const messageWithUserData = await newMessage.populate([
            { path: "from_user_id", select: "name email" },
            { path: "to_user_id", select: "name email" },
        ]);

        // Push to receiver (all their open tabs)
        if (connections[to_user_id]) {
            connections[to_user_id].forEach((res) =>
                res.write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
            );
        }

        // Push to sender too (all their open tabs)
        if (connections[from_user_id]) {
            connections[from_user_id].forEach((res) =>
                res.write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
            );
        }

        res.json({ success: true, message: messageWithUserData });
    } catch (err) {
        console.error("Send message error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all messages between two users

export const getChatMessages = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { to_user_id } = req.body;

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ]
        })
            .populate("from_user_id", "name _id image")
            .populate("to_user_id", "name _id image")
            .sort({ createdAt: -1 });

        await Message.updateMany(
            { from_user_id: to_user_id, to_user_id: userId, seen: false },
            { seen: true }
        );
        console.log("userId:", req.body.userId, "to_user_id:", req.body.to_user_id);


        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get recent chats for logged-in user
export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.body; // authUser sets this from token
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId" });
        }

        const messages = await Message.find({
            $or: [
                { from_user_id: new mongoose.Types.ObjectId(userId) },
                { to_user_id: new mongoose.Types.ObjectId(userId) },
            ],
        })
            .populate("from_user_id to_user_id", "name _id image")
            .sort({ createdAt: -1 });


        const chatMap = {};
        for (const msg of messages) {
            if (!msg.from_user_id || !msg.to_user_id) continue;

            const idA = msg.from_user_id._id.toString();
            const idB = msg.to_user_id._id.toString();
            const chatId = [idA, idB].sort().join("_");

            if (!chatMap[chatId]) {
                chatMap[chatId] = {
                    _id: chatId,
                    from_user_id: msg.from_user_id,
                    to_user_id: msg.to_user_id,
                    lastMessage: msg.text,
                };
            }
        }

        res.json({ success: true, messages: Object.values(chatMap) });
    } catch (error) {
        console.error("getUserRecentMessages error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



// 🔹 Keep-alive (every 15s)
setInterval(() => {
    Object.values(connections).forEach((resArray) => {
        resArray.forEach((res) => res.write(": keep-alive\n\n"));
    });
}, 15000);
