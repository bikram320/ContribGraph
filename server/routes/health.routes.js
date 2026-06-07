const express = require("express");
const router = express.Router();
const { basicHealth, detailedHealth, ping } = require("../controllers/health.controller");

// GET /health         → quick status check
// GET /health/detailed → full system info
// GET /health/ping    → simple ping/pong

router.get("/", basicHealth);
router.get("/detailed", detailedHealth);
router.get("/ping", ping);

module.exports = router;
