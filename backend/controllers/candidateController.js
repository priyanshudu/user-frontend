const supabase = require('../config/db');
const jwt = require("jsonwebtoken");

/**
 * STEP 1: Signup start (OTP already handled by Supabase frontend)
 */
const startCandidateSignup = async (req, res) => {
  return res.json({ message: "OTP sent via Supabase" });
};

/**
 * STEP 2: Save candidate after email confirmation
 */
const verifyCandidateOtp = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          name,
          email,
          phone,
          password
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.json({ success: true, candidate: data });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * STEP 3: Login
 */
const candidateLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find candidate in DB
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2️⃣ Generate JWT
    const token = jwt.sign(
      {
        candidateId: data.id,
        email: data.email,
        role: "candidate"
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 3️⃣ Return candidate info + token
    return res.json({
      success: true,
      token, // <-- JWT for frontend
      candidate: {
        id: data.id,
        name: data.name,
        email: data.email
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  startCandidateSignup,
  verifyCandidateOtp,
  candidateLogin
};
