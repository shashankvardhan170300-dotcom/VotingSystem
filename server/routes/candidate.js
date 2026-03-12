const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Get candidates for a specific election
router.get('/election/:electionId', async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add candidate to an election (admin only)
router.post('/', [auth, admin], async (req, res) => {
  const { name, party, electionId } = req.body;

  try {
    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    const newCandidate = new Candidate({
      name,
      party,
      election: electionId
    });

    const candidate = await newCandidate.save();
    
    // Add candidate to election's candidates array
    election.candidates.push(candidate._id);
    await election.save();
    
    res.json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Other CRUD operations...

module.exports = router;
