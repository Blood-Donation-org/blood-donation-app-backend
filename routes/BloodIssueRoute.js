const express = require('express');
const router = express.Router();
const { issueBlood, getAllBloodIssues } = require('../controllers/BloodIssueController');

router.post('/issue', issueBlood);
router.get('/', getAllBloodIssues);

module.exports = router;
