const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Get all active elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find({ isActive: true })
      .sort({ startDate: 1 });
    res.json(elections);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get a specific election
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }
    res.json(election);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create a new election (admin only)
router.post('/', [auth, admin], async (req, res) => {
  const { title, description, startDate, endDate } = req.body;

  try {
    const newElection = new Election({
      title,
      description,
      startDate,
      endDate
    });

    const election = await newElection.save();
    res.json(election);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update an election (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }
    res.json(election);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete an election (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    await Election.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Election removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
