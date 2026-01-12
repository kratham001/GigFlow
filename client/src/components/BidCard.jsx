import React from 'react';

const BidCard = ({ bid, isOwner, onHire }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hired: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-gray-100 text-gray-500 border-gray-200 opacity-60",
  };

  return (
    <div className={`p-4 mb-3 border rounded-lg shadow-sm ${bid.status === 'rejected' ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-lg">{bid.freelancerId?.name || "Unknown Freelancer"}</h4>
          <p className="text-gray-600 mt-1">{bid.message}</p>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[bid.status]}`}>
          {bid.status.toUpperCase()}
        </span>
      </div>

      {isOwner && bid.status === 'pending' && (
        <button 
          onClick={() => onHire(bid._id)}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors cursor-pointer"
        >
          Hire Applicant
        </button>
      )}
    </div>
  );
};

export default BidCard;