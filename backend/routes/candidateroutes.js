const express = require('express');
const router = express.Router();

const {
  startCandidateSignup,
  verifyCandidateOtp,
  candidateLogin
} = require('../controllers/candidateController');

router.post('/signup-start', startCandidateSignup);
router.post('/signup-verify', verifyCandidateOtp);
router.post('/login', candidateLogin);

module.exports = router;
