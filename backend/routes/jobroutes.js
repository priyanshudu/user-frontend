const express = require("express");
const router = express.Router();
const supabase = require("../config/db");

// GET all jobs
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({ success: true, jobs: data });
});

module.exports = router;
