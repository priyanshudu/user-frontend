const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const verifyCandidateToken = require('../middleware/authMiddleware');

// Candidate Profile Routes
router.get('/profile', verifyCandidateToken, applicationController.getCandidateProfile);
router.post('/profile', verifyCandidateToken, applicationController.createOrUpdateProfile);

// Job Application Routes
router.post('/apply', verifyCandidateToken, applicationController.applyForJob);
router.get('/applied/:jobId', verifyCandidateToken, applicationController.checkApplied);

module.exports = router;
