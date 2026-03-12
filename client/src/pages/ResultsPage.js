import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResultsPage = () => {
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { electionId } = useParams();
  
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    // Fetch initial results
    const fetchResults = async () => {
      try {
        let interval;
        const response = await axios.get(`http://localhost:5000/api/results/${electionId}`);
        setElection(response.data.election);
        setResults(response.data.results);
        setTotalVotes(response.data.totalVotes);
        setLoading(false);
        
        // Update countdown
        const updateCountdown = () => {
          const now = new Date();
          const end = new Date(response.data.election.endDate);
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
        setError('Failed to load election results');
        setLoading(false);
      }
    };
    
    fetchResults();
    
    // Listen for vote updates
    socket.on('voteUpdate', (data) => {
      if (data.electionId === electionId) {
        // Update the results when a new vote is cast
        setResults(prevResults => {
          const newResults = [...prevResults];
          const candidateIndex = newResults.findIndex(candidate => candidate.id === data.candidateId);
          
          if (candidateIndex !== -1) {
            newResults[candidateIndex].votes = data.votes;
            
            // Recalculate total votes and percentages
            const newTotalVotes = newResults.reduce((sum, candidate) => sum + candidate.votes, 0);
            setTotalVotes(newTotalVotes);
            
            // Update percentages for all candidates
            return newResults.map(candidate => ({
              ...candidate,
              percentage: Math.round((candidate.votes / newTotalVotes) * 100) || 0
            }));
          }
          
          return prevResults;
        });
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [electionId]);
  
  // Prepare chart data
  const chartData = {
    labels: results.map(result => result.name),
    datasets: [
      {
        label: '# of Votes',
        data: results.map(result => result.votes),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  
  return (
    <div className="container mt-5">
      {election && (
        <>
          <h1 className="text-center mb-2">{election.title} - Results</h1>
          <div className="alert alert-info text-center">
            <strong>Election ends in: {countdown}</strong>
          </div>
          <div className="alert alert-secondary text-center">
            Total votes: {totalVotes}
          </div>
        </>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <Bar data={chartData} />
        </div>
      </div>
      
      <div className="row">
        {results.map((result) => (
          <div key={result.id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{result.name}</h5>
                <p className="card-text">Party: {result.party}</p>
                <div className="progress mb-3">
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${result.percentage}%` }} 
                    aria-valuenow={result.percentage} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {result.percentage}%
                  </div>
                </div>
                <p className="card-text">Votes: {result.votes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;
