const express = require('express');
const router = express.Router();
const { getGigs, createGig } = require('../controllers/gigController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getGigs);
router.post('/', protect, createGig);

module.exports = router;