const express = require('express');
const router = express.Router();
const { createBid, getBidsForGig, hireFreelancer } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBid);
router.get('/:gigId', protect, getBidsForGig);
router.patch('/:bidId/hire', protect, hireFreelancer);

module.exports = router;