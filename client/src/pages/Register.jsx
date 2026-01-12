import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData))
      .unwrap()
      .then(() => {
        toast.success('Account created!');
        navigate('/');
      })
      .catch((err) => toast.error(err));
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Join GigFlow</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input 
            type="text" required 
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" required 
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" required 
            className="w-full border p-2 rounded"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
        <button 
          type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-green-300"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;