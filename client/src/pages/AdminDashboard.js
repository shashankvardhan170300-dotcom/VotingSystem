import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [elections, setElections] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', electionId: '' });
  const [newElection, setNewElection] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState({ users: false, elections: false });
  const [error, setError] = useState('');

  
  useEffect(() => {
    fetchUsers();
    fetchElections();
  }, []);

  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
      setError('Failed to fetch users.');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchElections = async () => {
    setLoading(prev => ({ ...prev, elections: true }));
    try {
      const res = await api.get('/admin/elections');
      setElections(res.data);
    } catch (err) {
      console.error('Error fetching elections', err);
      setError('Failed to fetch elections.');
    } finally {
      setLoading(prev => ({ ...prev, elections: false }));
    }
  };
  
  const handleDeleteElection = async (id) => {
    if (window.confirm('Are you sure you want to delete this election?')) {
      try {
        await api.delete(`/elections/${id}`);
        fetchElections(); // Refresh list
      } catch (err) {
        console.error('Error deleting election', err);
        setError('Failed to delete election.');
      }
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/candidates', newCandidate);
      alert('Candidate added successfully!');
      setNewCandidate({ name: '', party: '', electionId: '' });
    } catch (err) {
      console.error('Error adding candidate', err);
      setError(err.response?.data?.message || 'Error adding candidate');
    }
  };
  
  const handleAddElection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/elections', newElection);
      alert('Election added successfully!');
      setNewElection({ title: '', description: '', startDate: '', endDate: '' });
      fetchElections(); // Refresh elections
    } catch (err) {
      console.error('Error adding election', err);
      setError(err.response?.data?.message || 'Error adding election');
    }
  };
  
  

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Users List */}
      <h4>Registered Users</h4>
      {loading.users ? <p>Loading users...</p> : (
        <table className="table table-bordered">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? 'Admin' : 'User'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Elections List */}
      <h4 className="mt-5">Manage Elections</h4>
      {loading.elections ? <p>Loading elections...</p> : (
        <table className="table table-striped">
          <thead>
            <tr><th>Title</th><th>Ends</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {elections.map(election => (
              <tr key={election._id}>
                <td>{election.title}</td>
                <td>{new Date(election.endDate).toLocaleString()}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteElection(election._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Candidate */}
      <h4 className="mt-5">Add Candidate</h4>
      <form onSubmit={handleAddCandidate}>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Candidate Name"
            value={newCandidate.name}
            onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Party Name"
            value={newCandidate.party}
            onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <select
            className="form-control"
            value={newCandidate.electionId}
            onChange={(e) => setNewCandidate({ ...newCandidate, electionId: e.target.value })}
          >
            <option value="">Select Election</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-success w-100">Add Candidate</button>
      </form>

      {/* Add Election */}
      <h4 className="mt-5">Add New Election</h4>
      <form onSubmit={handleAddElection}>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Election Title"
            value={newElection.title}
            onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <textarea
            className="form-control"
            placeholder="Election Description"
            value={newElection.description}
            onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="datetime-local"
            className="form-control"
            value={newElection.startDate}
            onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="datetime-local"
            className="form-control"
            value={newElection.endDate}
            onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Add Election</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
