const Gig = require('../models/Gig');

const getGigs = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { title: { $regex: req.query.search, $options: 'i' } }
      : {};

    const gigs = await Gig.find({ ...keyword, status: 'open' }).populate('ownerId', 'name');
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGig = async (req, res) => {
  const { title, description, budget } = req.body;

  if (!title || !description || !budget) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const gig = await Gig.create({
    title,
    description,
    budget,
    ownerId: req.user._id,
  });

  res.status(201).json(gig);
};

module.exports = { getGigs, createGig };