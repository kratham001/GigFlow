const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

const createBid = async (req, res) => {
  const { gigId, message } = req.body;

  try {
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.status !== 'open') return res.status(400).json({ message: 'Gig is closed' });

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBidsForGig = async (req, res) => {
  const { gigId } = req.params;

  try {
    const gig = await Gig.findById(gigId);
    
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bids = await Bid.find({ gigId }).populate('freelancerId', 'name');
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const hireFreelancer = async (req, res) => {
  const { bidId } = req.params;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bid = await Bid.findById(bidId).session(session);
    if (!bid) throw new Error("Bid not found.");

    const gig = await Gig.findById(bid.gigId).session(session);
    
    if (gig.ownerId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    if (gig.status !== 'open') {
      throw new Error("Gig already assigned.");
    }

    gig.status = 'assigned';
    await gig.save({ session });

    bid.status = 'hired';
    await bid.save({ session });

    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bidId } },
      { status: 'rejected' }
    ).session(session);

    await session.commitTransaction();
    session.endSession();

    const io = req.app.get('io');
    if (io) {
      io.to(bid.freelancerId.toString()).emit('notification', {
        type: 'HIRED',
        message: `You have been hired for: ${gig.title}`,
        gigId: gig._id
      });
    }

    res.json({ success: true, message: "Hired successfully", gig, bid });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createBid, getBidsForGig, hireFreelancer };