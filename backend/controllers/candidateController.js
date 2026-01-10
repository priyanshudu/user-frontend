const supabase = require('../config/db');

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

    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res.json({ success: true, candidate: data });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  startCandidateSignup,
  verifyCandidateOtp,
  candidateLogin
};
