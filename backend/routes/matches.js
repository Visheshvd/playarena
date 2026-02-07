const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/matches/ongoing
 * @desc    Get all currently ongoing matches
 * @access  Public
 */
router.get('/ongoing', async (req, res) => {
  try {
    // Find all matches with status 'ongoing'
    const ongoingMatches = await Match.find({
      status: 'ongoing'
    })
      .populate('user1', 'name mobile')
      .populate('user2', 'name mobile')
      .sort({ createdAt: -1 })
      .limit(20);

    const matchesData = ongoingMatches.map(match => ({
      _id: match._id,
      player1Name: match.player1Name,
      player1Points: match.player1Points || 0,
      player2Name: match.player2Name,
      player2Points: match.player2Points || 0,
      gameType: match.gameType,
      status: match.status
    }));

    res.json({
      status: 'success',
      data: {
        matches: matchesData,
        count: matchesData.length
      }
    });
  } catch (error) {
    console.error('Get Ongoing Matches Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch ongoing matches'
    });
  }
});

/**
 * @route   GET /api/matches/past
 * @desc    Get completed matches from today
 * @access  Public
 */
router.get('/past', async (req, res) => {
  try {
    // Get today's date range
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const pastMatches = await Match.find({
      status: 'completed',
      matchDate: {
        $gte: todayStart,
        $lt: todayEnd
      }
    })
      .populate('user1', 'name mobile')
      .populate('user2', 'name mobile')
      .sort({ createdAt: -1 })
      .limit(50);

    const matchesData = pastMatches.map(match => {
      const p1Points = match.player1Points || 0;
      const p2Points = match.player2Points || 0;
      
      return {
        _id: match._id,
        player1Name: match.player1Name,
        player1Points: p1Points,
        player2Name: match.player2Name,
        player2Points: p2Points,
        gameType: match.gameType,
        status: match.status,
        winner: p1Points > p2Points ? match.player1Name : (p2Points > p1Points ? match.player2Name : 'Draw'),
        matchDate: match.matchDate
      };
    });

    res.json({
      status: 'success',
      data: {
        matches: matchesData,
        count: matchesData.length
      }
    });
  } catch (error) {
    console.error('Get Past Matches Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch past matches'
    });
  }
});

/**
 * @route   GET /api/matches/my-history
 * @desc    Get authenticated user's match history
 * @access  Private
 */
router.get('/my-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all completed matches where user is player1 or player2
    const matches = await Match.find({
      status: 'completed',
      $or: [
        { user1: userId },
        { user2: userId }
      ]
    })
      .sort({ matchDate: -1 })
      .limit(10);

    const matchHistory = matches.map(match => {
      // Determine if user is player1 or player2
      const isPlayer1 = match.user1 && match.user1.toString() === userId.toString();
      
      // Get user's points and opponent's points
      const userPoints = isPlayer1 ? match.player1Points : match.player2Points;
      const opponentPoints = isPlayer1 ? match.player2Points : match.player1Points;
      const opponentName = isPlayer1 ? match.player2Name : match.player1Name;
      
      // Determine result
      let result = 'draw';
      if (userPoints > opponentPoints) result = 'won';
      else if (userPoints < opponentPoints) result = 'lost';
      
      return {
        _id: match._id,
        opponent: opponentName,
        userPoints: userPoints || 0,
        opponentPoints: opponentPoints || 0,
        result: result,
        gameType: match.gameType,
        matchDate: match.matchDate
      };
    });

    res.json({
      status: 'success',
      data: {
        matches: matchHistory,
        count: matchHistory.length
      }
    });
  } catch (error) {
    console.error('Get Match History Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch match history'
    });
  }
});

/**
 * @route   GET /api/matches/records
 * @desc    Get leaderboard - top 10 players by points
 * @access  Public
 */
router.get('/records', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get top 10 users by total points
    const topUsers = await User.find({ role: 'customer' })
      .select('name mobile stats')
      .sort({ 'stats.totalPoints': -1 })
      .limit(10);

    // Format leaderboard data
    const leaderboard = topUsers.map(user => ({
      _id: user.name || user.mobile,
      playerName: user.name || user.mobile,
      totalPoints: user.stats?.totalPoints || 0,
      totalWins: user.stats?.totalWins || 0,
      totalLosses: user.stats?.totalLosses || 0,
      highestBreak: user.stats?.highestBreak || 0
    }));

    res.json({
      status: 'success',
      data: {
        records: leaderboard
      }
    });
  } catch (error) {
    console.error('Get Match Records Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch match records'
    });
  }
});

module.exports = router;
