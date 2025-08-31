const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()


// Register new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  const pool = req.app.locals.pool

  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user (user_code will be auto-generated as UUID v7)
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, user_code',
      [name, email, passwordHash]
    )

    const user = result.rows[0]

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userCode: user.user_code
      },
      partner: null,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const pool = req.app.locals.pool

  try {
    // Find user
    const result = await pool.query(
      `SELECT u1.*, u2.name as partner_name, u2.email as partner_email, u2.id as partner_id
       FROM users u1 
       LEFT JOIN users u2 ON u1.partner_id = u2.id 
       WHERE u1.email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    const partner = user.partner_id ? {
      id: user.partner_id,
      name: user.partner_name,
      email: user.partner_email
    } : null

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userCode: user.user_code
      },
      partner,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool

  try {
    const result = await pool.query(
      `SELECT u1.*, u2.name as partner_name, u2.email as partner_email, u2.id as partner_id
       FROM users u1 
       LEFT JOIN users u2 ON u1.partner_id = u2.id 
       WHERE u1.id = $1`,
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = result.rows[0]
    const partner = user.partner_id ? {
      id: user.partner_id,
      name: user.partner_name,
      email: user.partner_email
    } : null

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userCode: user.user_code
      },
      partner
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Pair with partner
router.post('/pair', authenticateToken, async (req, res) => {
  const { partnerCode } = req.body
  const pool = req.app.locals.pool

  try {
    // Find partner by code
    const partnerResult = await pool.query('SELECT * FROM users WHERE user_code = $1', [partnerCode])
    if (partnerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' })
    }

    const partner = partnerResult.rows[0]

    // Check if trying to pair with self
    if (partner.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot pair with yourself' })
    }

    // Update both users to be partners
    await pool.query('BEGIN')
    
    await pool.query('UPDATE users SET partner_id = $1 WHERE id = $2', [partner.id, req.user.id])
    await pool.query('UPDATE users SET partner_id = $1 WHERE id = $2', [req.user.id, partner.id])
    
    await pool.query('COMMIT')

    res.json({
      id: partner.id,
      name: partner.name,
      email: partner.email
    })
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('Pairing error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router