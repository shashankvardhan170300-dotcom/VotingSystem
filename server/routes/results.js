const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const auth = require('../middleware/authMiddleware');

// Get results for a specific election
router.get('/:electionId', async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    const candidates = await Candidate.find({ election: req.params.electionId });
    
    // Get total votes for this election
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    
    // Format results with percentage
    const results = candidates.map(candidate => ({
      id: candidate._id,
      name: candidate.name,
      party: candidate.party,
      votes: candidate.votes,
      percentage: totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
    }));
    
    res.json({
      election,
      totalVotes,
      results,
      remainingTime: new Date(election.endDate) - new Date()
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
