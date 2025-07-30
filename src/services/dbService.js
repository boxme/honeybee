import initSqlJs from 'sql.js'

class DatabaseService {
  constructor() {
    this.db = null
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      })

      const existingDb = localStorage.getItem('honeybee-db')
      
      if (existingDb) {
        const uInt8Array = new Uint8Array(JSON.parse(existingDb))
        this.db = new SQL.Database(uInt8Array)
      } else {
        this.db = new SQL.Database()
        this.createTables()
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }

  createTables() {
    const createEventsTable = `
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        time TEXT,
        location TEXT,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        remote_id INTEGER
      )
    `

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        partner_id INTEGER,
        user_code TEXT,
        last_sync TEXT
      )
    `

    this.db.exec(createEventsTable)
    this.db.exec(createUsersTable)
    this.saveToStorage()
  }

  saveToStorage() {
    if (this.db) {
      const data = this.db.export()
      localStorage.setItem('honeybee-db', JSON.stringify(Array.from(data)))
    }
  }

  async getEvents() {
    await this.initialize()
    const stmt = this.db.prepare('SELECT * FROM events ORDER BY date ASC, time ASC')
    const events = []
    
    while (stmt.step()) {
      events.push(stmt.getAsObject())
    }
    
    stmt.free()
    return events
  }

  async createEvent(event) {
    await this.initialize()
    const stmt = this.db.prepare(`
      INSERT INTO events (title, description, date, time, location, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run([
      event.title,
      event.description || null,
      event.date,
      event.time || null,
      event.location || null,
      event.created_by
    ])
    
    const id = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]
    stmt.free()
    this.saveToStorage()
    
    return { id, ...event }
  }

  async updateEvent(id, updates) {
    await this.initialize()
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    
    const stmt = this.db.prepare(`
      UPDATE events SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    
    stmt.run([...values, id])
    stmt.free()
    this.saveToStorage()
  }

  async deleteEvent(id) {
    await this.initialize()
    const stmt = this.db.prepare('DELETE FROM events WHERE id = ?')
    stmt.run([id])
    stmt.free()
    this.saveToStorage()
  }

  async markAsSynced(id, remoteId) {
    await this.initialize()
    const stmt = this.db.prepare('UPDATE events SET synced = 1, remote_id = ? WHERE id = ?')
    stmt.run([remoteId, id])
    stmt.free()
    this.saveToStorage()
  }

  async getUnsyncedEvents() {
    await this.initialize()
    const stmt = this.db.prepare('SELECT * FROM events WHERE synced = 0')
    const events = []
    
    while (stmt.step()) {
      events.push(stmt.getAsObject())
    }
    
    stmt.free()
    return events
  }
}

export const dbService = new DatabaseService()