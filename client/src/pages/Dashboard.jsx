import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useSelector((state) => state.auth);
  
  // --- STATE FOR POST GIG MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [newGig, setNewGig] = useState({ title: '', description: '', budget: '' });

  // --- STATE FOR BIDDING MODAL (NEW) ---
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [bidData, setBidData] = useState({ amount: '', message: '' });

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async (query = '') => {
    try {
      const res = await api.get(`/gigs?search=${query}`);
      setGigs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGigs(search);
  };

  // --- POST GIG FUNCTION ---
  const createGig = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gigs', newGig);
      toast.success('Gig posted!');
      setShowModal(false);
      fetchGigs();
      setNewGig({ title: '', description: '', budget: '' });
    } catch (err) {
      toast.error('Failed to post gig');
    }
  };

  // --- OPEN BID MODAL FUNCTION (NEW) ---
  const openBidModal = (gigId) => {
    setSelectedGigId(gigId); // Remember which gig we are bidding on
    setShowBidModal(true);   // Show the popup
  };

  // --- SUBMIT BID FUNCTION (NEW) ---
  const submitBid = async (e) => {
    e.preventDefault();
    try {
      // Send the bid to the backend
      await api.post('/bids', {
        gigId: selectedGigId,
        amount: Number(bidData.amount),
        message: bidData.message
      });

      toast.success('Bid sent successfully!');
      setShowBidModal(false); // Close the popup
      setBidData({ amount: '', message: '' }); // Reset form
      // No need to redirect; you are already on the Dashboard!
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send bid');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Gigs</h1>
        {user && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Post a Gig
          </button>
        )}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input 
          type="text"
          placeholder="Search gigs..."
          className="border p-2 rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded">Search</button>
      </form>

      {/* Gig Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.map((gig) => (
          <div key={gig._id} className="border p-5 rounded-lg shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">{gig.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{gig.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span className="font-medium text-green-600">Budget: ${gig.budget}</span>
                <span>By: {gig.ownerId?.name}</span>
              </div>
            </div>

            {/* BUTTONS SECTION */}
            <div className="flex gap-2 mt-auto">
              <Link 
                to={`/gig/${gig._id}`}
                className="flex-1 text-center border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition"
              >
                Details
              </Link>
              
              {/* Only show 'Quick Bid' if user is NOT the owner */}
              {user && user._id !== gig.ownerId?._id && (
                <button 
                  onClick={() => openBidModal(gig._id)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Quick Bid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- POST GIG MODAL (EXISTING) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Post New Gig</h2>
            <form onSubmit={createGig} className="flex flex-col gap-3">
              <input 
                type="text" placeholder="Title" required 
                className="border p-2 rounded"
                value={newGig.title} onChange={e => setNewGig({...newGig, title: e.target.value})}
              />
              <textarea 
                placeholder="Description" required 
                className="border p-2 rounded h-32"
                value={newGig.description} onChange={e => setNewGig({...newGig, description: e.target.value})}
              />
              <input 
                type="number" placeholder="Budget ($)" required 
                className="border p-2 rounded"
                value={newGig.budget} onChange={e => setNewGig({...newGig, budget: e.target.value})}
              />
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
                <button type="submit" className="flex-1 bg-gray-900 text-white py-2 rounded">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- QUICK BID MODAL (NEW) --- */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Send a Proposal</h2>
            <form onSubmit={submitBid} className="flex flex-col gap-3">
              
              <label className="text-sm font-semibold text-gray-700">Your Price ($)</label>
              <input 
                type="number" 
                placeholder="e.g. 50" 
                required 
                className="border p-2 rounded"
                value={bidData.amount} 
                onChange={e => setBidData({...bidData, amount: e.target.value})}
              />

              <label className="text-sm font-semibold text-gray-700">Cover Letter</label>
              <textarea 
                placeholder="Why should they hire you?" 
                required 
                className="border p-2 rounded h-32"
                value={bidData.message} 
                onChange={e => setBidData({...bidData, message: e.target.value})}
              />

              <div className="flex gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowBidModal(false)} 
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Send Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;