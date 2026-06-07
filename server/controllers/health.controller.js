const os = require("os");

// Track server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * GET /health
 * Basic health check — use this for load balancers / uptime monitors
 */
const basicHealth = (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
};

/**
 * GET /health/detailed
 * Full system info — useful for debugging and dashboards
 */
const detailedHealth = async (req, res) => {
    try {
        const uptimeMs = Date.now() - serverStartTime;
        const memoryUsage = process.memoryUsage();

        const health = {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: {
                ms: uptimeMs,
                human: formatUptime(uptimeMs),
            },
            process: {
                pid: process.pid,
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                env: process.env.NODE_ENV || "development",
            },
            memory: {
                rss: formatBytes(memoryUsage.rss),
                heapTotal: formatBytes(memoryUsage.heapTotal),
                heapUsed: formatBytes(memoryUsage.heapUsed),
                external: formatBytes(memoryUsage.external),
            },
            system: {
                hostname: os.hostname(),
                cpus: os.cpus().length,
                loadAvg: os.loadavg().map((v) => v.toFixed(2)),
                totalMemory: formatBytes(os.totalmem()),
                freeMemory: formatBytes(os.freemem()),
            },
        };

        res.status(200).json(health);
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

/**
 * GET /health/ping
 * Dead-simple ping — just returns pong
 */
const ping = (req, res) => {
    res.status(200).json({ message: "pong" });
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

module.exports = { basicHealth, detailedHealth, ping };