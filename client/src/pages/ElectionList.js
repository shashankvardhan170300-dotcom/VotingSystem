import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ElectionList = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/elections', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setElections(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error details:", error);
        
        if (error.response) {
          // Server responded with an error status code
          setError(`Failed to load elections: ${error.response.data.msg || error.response.statusText}`);
        } else if (error.request) {
          // Request was made but no response received
          setError('Server not responding. Please check your connection.');
        } else {
          // Error in request setup
          setError(`Request error: ${error.message}`);
        }
        
        setLoading(false);
      }
      
    };

    fetchElections();
  }, []);

  // Function to format countdown
  const formatCountdown = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Active Elections</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row">
        {elections.map(election => (
          <div key={election._id} className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{election.title}</h5>
                <p className="card-text">{election.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-primary">
                    Ends in: {formatCountdown(election.endDate)}
                  </span>
                  <div>
                    <Link to={`/vote/${election._id}`} className="btn btn-success me-2">Vote</Link>
                    <Link to={`/results/${election._id}`} className="btn btn-info">Results</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectionList;
