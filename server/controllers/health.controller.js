import os from "os";

const serverStartTime = Date.now();

export const basicHealth = (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
};

export const detailedHealth = async (req, res) => {
    try {
        const uptimeMs = Date.now() - serverStartTime;
        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: uptimeMs,
            memory: process.memoryUsage(),
            env: process.env.NODE_ENV || "development",
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

export const ping = (req, res) => {
    res.status(200).json({ message: "pong" });
};