const express = require('express')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get all events for user and partner
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool

  try {
    // Get user's partner ID
    const userResult = await pool.query('SELECT partner_id FROM users WHERE id = $1', [req.user.id])
    const partnerId = userResult.rows[0]?.partner_id

    let query = `
      SELECT e.*, u.name as created_by_name 
      FROM events e
      JOIN users u ON e.created_by = u.id
      WHERE e.created_by = $1
    `
    let params = [req.user.id]

    if (partnerId) {
      query += ` OR e.created_by = $2`
      params.push(partnerId)
    }

    query += ` ORDER BY e.date ASC, e.time ASC`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new event
router.post('/', async (req, res) => {
  const { title, description, date, time, location } = req.body
  const pool = req.app.locals.pool

  try {
    const result = await pool.query(
      `INSERT INTO events (title, description, date, time, location, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, date, time, location, req.user.id]
    )

    const event = result.rows[0]
    
    // Get creator name
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id])
    event.created_by_name = userResult.rows[0]?.name

    res.status(201).json(event)
  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update event
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { title, description, date, time, location } = req.body
  const pool = req.app.locals.pool

  try {
    // Check if user owns this event
    const ownerCheck = await pool.query('SELECT created_by FROM events WHERE id = $1', [id])
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    if (ownerCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' })
    }

    const result = await pool.query(
      `UPDATE events 
       SET title = $1, description = $2, date = $3, time = $4, location = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, date, time, location, id]
    )

    const event = result.rows[0]
    
    // Get creator name
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id])
    event.created_by_name = userResult.rows[0]?.name

    res.json(event)
  } catch (error) {
    console.error('Update event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete event
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const pool = req.app.locals.pool

  try {
    // Check if user owns this event
    const ownerCheck = await pool.query('SELECT created_by FROM events WHERE id = $1', [id])
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' })
    }
    
    if (ownerCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' })
    }

    await pool.query('DELETE FROM events WHERE id = $1', [id])
    res.status(204).send()
  } catch (error) {
    console.error('Delete event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sync events (for offline support)
router.post('/sync', async (req, res) => {
  const { events } = req.body
  const pool = req.app.locals.pool

  try {
    const syncedEvents = []
    
    for (const event of events) {
      if (event.id && event.id > 0) {
        // This is a local event that needs to be synced to server
        const result = await pool.query(
          `INSERT INTO events (title, description, date, time, location, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [event.title, event.description, event.date, event.time, event.location, req.user.id]
        )
        
        syncedEvents.push({
          localId: event.id,
          remoteId: result.rows[0].id,
          event: result.rows[0]
        })
      }
    }

    res.json({ syncedEvents })
  } catch (error) {
    console.error('Sync events error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router