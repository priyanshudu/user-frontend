const jwt = require("jsonwebtoken");

/**
 * Middleware to protect routes with JWT
 */
const verifyCandidateToken = (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Attach candidate info to request
    req.candidate = {
      id: decoded.candidateId,
      email: decoded.email,
      role: decoded.role
    };

    // 4️⃣ Move to next middleware/controller
    next();

  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyCandidateToken;
