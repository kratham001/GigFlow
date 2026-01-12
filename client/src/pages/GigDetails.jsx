import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBidsByGigId, hireFreelancer } from '../features/bidSlice';
import api from '../api/axiosInstance';
import BidCard from '../components/BidCard';
import toast from 'react-hot-toast';

const GigDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bids } = useSelector((state) => state.bids);
  
  const [gig, setGig] = useState(null);
  const [bidMessage, setBidMessage] = useState('');

  
  useEffect(() => {
    const fetchGig = async () => {
      try {
        
        const res = await api.get(`/gigs`); 
        const foundGig = res.data.find(g => g._id === id);
        setGig(foundGig);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGig();
  }, [id]);

  
  useEffect(() => {
    if (gig && user && gig.ownerId._id === user._id) {
      dispatch(fetchBidsByGigId(id));
    }
  }, [gig, user, id, dispatch]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bids', { gigId: id, message: bidMessage });
      toast.success('Bid submitted successfully!');
      setBidMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit bid');
    }
  };

  const handleHire = (bidId) => {
    dispatch(hireFreelancer(bidId))
      .unwrap()
      .then(() => {
        toast.success("Freelancer hired successfully!");
        setGig(prev => ({ ...prev, status: 'assigned' }));
      })
      .catch((err) => toast.error(err));
  };

  if (!gig) return <div className="p-6 text-center">Loading gig details...</div>;

  const isOwner = user && user._id === gig.ownerId._id;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-800">{gig.title}</h1>
          <span className={`px-4 py-1 rounded-full text-sm font-bold ${gig.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {gig.status.toUpperCase()}
          </span>
        </div>
        <p className="mt-4 text-gray-600 text-lg leading-relaxed">{gig.description}</p>
        <div className="mt-6 flex gap-6 text-gray-500 font-medium">
          <span>Budget: ${gig.budget}</span>
          <span>Owner: {gig.ownerId.name}</span>
        </div>
      </div>

      {/* Freelancer View: Bid Form */}
      {!isOwner && user && gig.status === 'open' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Submit a Proposal</h3>
          <form onSubmit={handleBidSubmit}>
            <textarea
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="4"
              placeholder="Why are you the best fit for this gig?"
              value={bidMessage}
              onChange={(e) => setBidMessage(e.target.value)}
              required
            ></textarea>
            <button type="submit" className="mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Send Bid
            </button>
          </form>
        </div>
      )}

      {/* Owner View: Bid List */}
      {isOwner && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Proposals ({bids.length})</h3>
          {bids.length === 0 ? (
            <p className="text-gray-500 italic">No bids yet.</p>
          ) : (
            <div className="space-y-4">
              {bids.map(bid => (
                <BidCard 
                  key={bid._id} 
                  bid={bid} 
                  isOwner={isOwner} 
                  onHire={handleHire} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetails;