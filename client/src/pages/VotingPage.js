import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const VotingPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [votingSuccess, setVotingSuccess] = useState(false);
  
  const { electionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Function to check if user has already voted in this election
    const checkVotingStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/vote/status/${electionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasVoted(response.data.hasVoted);
      } catch (error) {
        setError('Failed to check voting status');
      }
    };

    // Function to fetch election details
    const fetchElection = async () => {
      let interval;
      try {
        const response = await axios.get(`http://localhost:5000/api/elections/${electionId}`);
        setElection(response.data);
        
        // Update countdown
        const updateCountdown = () => {
          const now = new Date();
          const end = new Date(response.data.endDate);
          const diff = end - now;
          
          if (diff <= 0) {
            setCountdown('Election has ended');
            clearInterval(interval);
          } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
          }
        };
        
        updateCountdown();
        interval = setInterval(updateCountdown, 1000);
        
        return () => clearInterval(interval);
      } catch (error) {
        setError('Failed to load election details');
      }
    };

    // Function to fetch candidates for this election
    const fetchCandidates = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/candidates/election/${electionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCandidates(response.data);
        setLoading(false);
        // alert('Candidates loaded successfully!');
      } catch (error) {
        setError('Failed to load candidates');
        setLoading(false);
      }
    };

    // Execute all data fetching functions
    checkVotingStatus();
    fetchElection();
    fetchCandidates();
  }, [electionId, navigate]);

  const handleVote = async (candidateId) => {
    if (hasVoted) {
      setError('You have already voted in this election');
      return;
    }
  
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/vote',
        { candidateId, electionId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
  
      setVotingSuccess(true);
      setHasVoted(true); // ✅ Instantly disable button after success
      setError(''); // ✅ Clear any previous error
    } catch (error) {
      if (error.response?.data?.msg) {
        setError(error.response.data.msg);
      } else {
        setError('Failed to cast vote');
      }
  
      if (error.response?.data?.msg?.toLowerCase().includes('already voted')) {
        setHasVoted(true); // ✅ Also disable button if server says duplicate
      }
    }
  };
  

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container mt-5">
      {election && (
        <>
          <h1 className="text-center mb-2">{election.title}</h1>
          <p className="text-center">{election.description}</p>
          <div className="alert alert-info text-center">
            <strong>Voting ends in: {countdown}</strong>
          </div>
        </>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      {votingSuccess && <div className="alert alert-success">Your vote has been recorded successfully!</div>}

{!votingSuccess && hasVoted && <div className="alert alert-warning">You have already voted in this election!</div>}

      
      <div className="row">
        {candidates.map((candidate) => (
          <div key={candidate._id} className="col-md-4 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">{candidate.name}</h5>
                {candidate.party && <p className="card-text">Party: {candidate.party}</p>}
                <button
                  onClick={() => handleVote(candidate._id)}
                  className={`btn ${hasVoted ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={hasVoted}
                >
                  {hasVoted ? 'Already Voted' : 'Vote'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotingPage;
