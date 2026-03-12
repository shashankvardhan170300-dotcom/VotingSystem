import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ElectionList from './pages/ElectionList';
import VotingPage from './pages/VotingPage';
import ResultsPage from './pages/ResultsPage';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
const App = () => {
  return (
    <>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/elections" element={<ElectionList />} />
        <Route path="/vote/:electionId" element={<VotingPage />} />
        <Route path="/results/:electionId" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/elections" element={<ElectionList />} />
        <Route path="/vote/:electionId" element={<VotingPage />} />

      </Routes>
    </Router>
    </>
  );
};

export default App;
