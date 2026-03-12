const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const auth = require('../middleware/authMiddleware');

// Cast a vote in an election
router.post('/', auth, async (req, res) => {
  const userId = req.user.id;
  const { candidateId, electionId } = req.body;

  try {
    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    const now = new Date();
    if (now < new Date(election.startDate) || now > new Date(election.endDate)) {
      return res.status(400).json({ msg: 'Election is not active at this time' });
    }

    // Check if user already voted in this election
    const existingVote = await Vote.findOne({ user: userId, election: electionId });
    if (existingVote) {
      return res.status(400).json({ msg: 'You have already voted in this election' });
    }

    // Check if candidate exists and belongs to this election
    const candidate = await Candidate.findOne({
      _id: candidateId,
      election: electionId
    });

    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found in this election' });
    }

    // Save the vote
    const vote = new Vote({
      user: userId,
      candidate: candidateId,
      election: electionId
    });
    await vote.save();

    // Increment candidate's vote count
    candidate.votes += 1;
    await candidate.save();

    // Emit live vote count update via Socket.IO
    const io = req.app.get('io');
    io.emit('voteUpdate', {
      electionId,
      candidateId,
      votes: candidate.votes,
      party: candidate.party,
      name: candidate.name
    });

    res.status(201).json({ msg: 'Vote cast successfully!' });
  } catch (err) {
    console.error('Vote casting error:', err.message);

    // Catch Duplicate vote error
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'You have already voted in this election (duplicate)' });
    }

    res.status(500).send('Server error');
  }
});

// Check if user has voted in a specific election
router.get('/status/:electionId', auth, async (req, res) => {
  try {
    const existingVote = await Vote.findOne({
      user: req.user.id,
      election: req.params.electionId
    });

    if (existingVote) {
      return res.json({ hasVoted: true, candidateId: existingVote.candidate });
    }
    res.json({ hasVoted: false });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
