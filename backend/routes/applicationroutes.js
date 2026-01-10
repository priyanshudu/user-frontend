const express = require('express');
const router = express.Router();

const {
  getCandidateProfile,
  createOrUpdateProfile,
  applyForJob,          // ✅ YOU MISSED THIS
  checkApplied        // ✅ add
} = require('../controllers/applicationController');

// Load personal info
router.get('/:candidateId', getCandidateProfile);

// Save / Update personal info
router.post('/createOrUpdate', createOrUpdateProfile);

// Apply for job
router.post('/apply', applyForJob);
router.get('/check/:candidateId/:jobId', checkApplied);
module.exports = router;
