const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

exports.hireFreelancer = async (req, res) => {
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
                message: `You have been hired for: ${gig.title}`
            });
        }

        res.json({ success: true, message: "Hired successfully" });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};