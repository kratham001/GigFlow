import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useSelector((state) => state.auth);
  
  // Modal State for new gig
  const [showModal, setShowModal] = useState(false);
  const [newGig, setNewGig] = useState({ title: '', description: '', budget: '' });

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Gigs</h1>
        {user && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Post a Gig
          </button>
        )}
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.map((gig) => (
          <div key={gig._id} className="border p-5 rounded-lg shadow-sm hover:shadow-md transition bg-white">
            <h3 className="text-xl font-semibold mb-2">{gig.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-3">{gig.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span className="font-medium text-green-600">Budget: ${gig.budget}</span>
              <span>By: {gig.ownerId?.name}</span>
            </div>
            <Link 
              to={`/gig/${gig._id}`}
              className="mt-4 block text-center border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
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
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;