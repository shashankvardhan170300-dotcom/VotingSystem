// routes/admin.js
const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const User = require('../models/User'); // ← Import User model
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const Election = require('../models/Election');

router.get('/elections', auth, admin, async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add candidate (admin only)
router.post('/candidates', auth, admin, async (req, res) => {
  const { name, party } = req.body;
  try {
    const candidate = new Candidate({ name, party, votes: 0 });
    await candidate.save();
    res.status(201).json({ msg: 'Candidate added by admin!', candidate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete candidate (admin only)
router.delete('/candidates/:id', auth, admin, async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Candidate removed!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add new election (admin only)
// routes/admin.js

router.post('/elections', auth, admin, async (req, res) => {
  const { title, description, startDate, endDate } = req.body;
  try {
    const election = new Election({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    await election.save();
    res.status(201).json({ msg: 'Election created successfully!', election });
  } catch (err) {
    console.error('Error adding election:', err);  // full error log
    res.status(500).json({ msg: err.message });
  }
});



module.exports = router;
