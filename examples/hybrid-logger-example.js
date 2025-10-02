#!/usr/bin/env node

/**
 * Hybrid Logger Example - JSONL + SQLite
 * 
 * Demonstrates how to combine JSONL (for storage) with SQLite (for indexing)
 * to get the best of both worlds: fast writes and fast queries.
 * 
 * This is an EXAMPLE implementation showing the concept.
 * NOT integrated into the main system yet.
 */

const fs = require('fs');
const path = require('path');

// Note: This example uses better-sqlite3 which is NOT installed by default
// To use this example, run: npm install better-sqlite3
// 
// For now, this is just a demonstration of the concept.

class HybridLogger {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.logsDir = path.join(projectRoot, '.claude/logs');
    this.jsonlPath = path.join(this.logsDir, 'sessions/hybrid.jsonl');
    this.dbPath = path.join(this.logsDir, 'index.db');
    
    // Check if better-sqlite3 is available
    try {
      const Database = require('better-sqlite3');
      this.db = new Database(this.dbPath);
      this.sqliteAvailable = true;
      this.initDB();
    } catch (error) {
      console.warn('⚠️  better-sqlite3 not installed. Using JSONL only mode.');
      console.warn('   To enable hybrid mode: npm install better-sqlite3');
      this.sqliteAvailable = false;
    }
  }

  /**
   * Initialize SQLite database schema
   */
  initDB() {
    if (!this.sqliteAvailable) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        agent TEXT NOT NULL,
        task_id TEXT NOT NULL,
        user_input TEXT,
        ai_response TEXT,
        jsonl_offset INTEGER NOT NULL,
        jsonl_length INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_timestamp ON sessions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_agent ON sessions(agent);
      CREATE INDEX IF NOT EXISTS idx_task_id ON sessions(task_id);
      CREATE INDEX IF NOT EXISTS idx_agent_task ON sessions(agent, task_id);
    `);
  }

  /**
   * Log a session (hybrid mode)
   * 
   * @param {Object} data - Session data
   * @returns {string} Session ID
   */
  logSession(data) {
    // Ensure JSONL directory exists
    const dir = path.dirname(this.jsonlPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. Write to JSONL (primary storage)
    const offset = fs.existsSync(this.jsonlPath) 
      ? fs.statSync(this.jsonlPath).size 
      : 0;
    
    const jsonLine = JSON.stringify(data) + '\n';
    fs.appendFileSync(this.jsonlPath, jsonLine, 'utf8');

    // 2. Write to SQLite (index)
    if (this.sqliteAvailable) {
      try {
        this.db.prepare(`
          INSERT INTO sessions (id, timestamp, agent, task_id, user_input, ai_response, jsonl_offset, jsonl_length)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          data.session_id,
          data.timestamp,
          data.agent,
          data.task_id,
          data.user_input,
          data.ai_response,
          offset,
          jsonLine.length
        );
      } catch (error) {
        console.error('SQLite insert failed:', error.message);
      }
    }

    return data.session_id;
  }

  /**
   * Query sessions (fast SQLite query)
   * 
   * @param {Object} filter - Query filter
   * @returns {Array} Matching sessions
   */
  querySessions(filter = {}) {
    if (!this.sqliteAvailable) {
      return this.querySessionsJSONL(filter);
    }

    // Build SQL query
    const conditions = [];
    const params = [];

    if (filter.agent) {
      conditions.push('agent = ?');
      params.push(filter.agent);
    }

    if (filter.task_id) {
      conditions.push('task_id = ?');
      params.push(filter.task_id);
    }

    if (filter.since) {
      conditions.push('timestamp >= ?');
      params.push(filter.since);
    }

    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    const sql = `SELECT * FROM sessions ${whereClause} ORDER BY timestamp DESC`;
    
    try {
      return this.db.prepare(sql).all(...params);
    } catch (error) {
      console.error('SQLite query failed:', error.message);
      return this.querySessionsJSONL(filter);
    }
  }

  /**
   * Fallback: Query sessions from JSONL (slower)
   */
  querySessionsJSONL(filter = {}) {
    if (!fs.existsSync(this.jsonlPath)) {
      return [];
    }

    const results = [];
    const lines = fs.readFileSync(this.jsonlPath, 'utf8').split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const data = JSON.parse(line);
        
        // Apply filters
        if (filter.agent && data.agent !== filter.agent) continue;
        if (filter.task_id && data.task_id !== filter.task_id) continue;
        if (filter.since && data.timestamp < filter.since) continue;

        results.push(data);
      } catch (error) {
        console.error('Failed to parse JSONL line:', error.message);
      }
    }

    return results;
  }

  /**
   * Get statistics (fast with SQLite)
   */
  getStats() {
    if (!this.sqliteAvailable) {
      return this.getStatsJSONL();
    }

    try {
      const total = this.db.prepare('SELECT COUNT(*) as count FROM sessions').get();
      const byAgent = this.db.prepare(`
        SELECT agent, COUNT(*) as count 
        FROM sessions 
        GROUP BY agent
      `).all();
      const byTask = this.db.prepare(`
        SELECT task_id, COUNT(*) as count 
        FROM sessions 
        GROUP BY task_id
        ORDER BY count DESC
        LIMIT 10
      `).all();

      return {
        total: total.count,
        by_agent: byAgent.reduce((acc, row) => {
          acc[row.agent] = row.count;
          return acc;
        }, {}),
        top_tasks: byTask.reduce((acc, row) => {
          acc[row.task_id] = row.count;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('SQLite stats failed:', error.message);
      return this.getStatsJSONL();
    }
  }

  /**
   * Fallback: Get statistics from JSONL
   */
  getStatsJSONL() {
    const sessions = this.querySessionsJSONL();
    const byAgent = {};
    const byTask = {};

    sessions.forEach(session => {
      byAgent[session.agent] = (byAgent[session.agent] || 0) + 1;
      byTask[session.task_id] = (byTask[session.task_id] || 0) + 1;
    });

    return {
      total: sessions.length,
      by_agent: byAgent,
      top_tasks: byTask
    };
  }

  /**
   * Rebuild SQLite index from JSONL
   */
  rebuildIndex() {
    if (!this.sqliteAvailable) {
      console.error('SQLite not available');
      return;
    }

    console.log('🔄 Rebuilding SQLite index from JSONL...');

    // Clear existing data
    this.db.exec('DELETE FROM sessions');

    // Read JSONL and rebuild
    if (!fs.existsSync(this.jsonlPath)) {
      console.log('✅ No JSONL file to rebuild from');
      return;
    }

    const lines = fs.readFileSync(this.jsonlPath, 'utf8').split('\n');
    let offset = 0;
    let count = 0;

    const insert = this.db.prepare(`
      INSERT INTO sessions (id, timestamp, agent, task_id, user_input, ai_response, jsonl_offset, jsonl_length)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((lines) => {
      for (const line of lines) {
        if (!line.trim()) {
          offset += line.length + 1;
          continue;
        }

        try {
          const data = JSON.parse(line);
          insert.run(
            data.session_id,
            data.timestamp,
            data.agent,
            data.task_id,
            data.user_input,
            data.ai_response,
            offset,
            line.length + 1
          );
          count++;
        } catch (error) {
          console.error('Failed to parse line:', error.message);
        }

        offset += line.length + 1;
      }
    });

    insertMany(lines);

    console.log(`✅ Rebuilt index with ${count} sessions`);
  }

  /**
   * Close database connection
   */
  close() {
    if (this.sqliteAvailable && this.db) {
      this.db.close();
    }
  }
}

// ============================================================================
// Demo
// ============================================================================

function demo() {
  console.log('🎬 Hybrid Logger Demo\n');

  const logger = new HybridLogger();

  // Demo 1: Log sessions
  console.log('📝 Demo 1: Logging sessions...');
  const sessions = [
    {
      session_id: 'session-1',
      timestamp: new Date().toISOString(),
      agent: 'developer',
      task_id: 'T001',
      user_input: 'Implement login',
      ai_response: 'Starting TDD...'
    },
    {
      session_id: 'session-2',
      timestamp: new Date().toISOString(),
      agent: 'developer',
      task_id: 'T001',
      user_input: 'Add tests',
      ai_response: 'Writing tests...'
    },
    {
      session_id: 'session-3',
      timestamp: new Date().toISOString(),
      agent: 'architect',
      task_id: 'T002',
      user_input: 'Design API',
      ai_response: 'Creating design...'
    }
  ];

  sessions.forEach(session => {
    logger.logSession(session);
    console.log(`  ✅ Logged: ${session.session_id}`);
  });

  console.log('');

  // Demo 2: Query sessions
  console.log('🔍 Demo 2: Querying sessions...');
  
  const start1 = Date.now();
  const results1 = logger.querySessions({ task_id: 'T001' });
  const duration1 = Date.now() - start1;
  console.log(`  Found ${results1.length} sessions for T001 (${duration1}ms)`);

  const start2 = Date.now();
  const results2 = logger.querySessions({ agent: 'developer' });
  const duration2 = Date.now() - start2;
  console.log(`  Found ${results2.length} sessions for developer (${duration2}ms)`);

  console.log('');

  // Demo 3: Statistics
  console.log('📊 Demo 3: Statistics...');
  const stats = logger.getStats();
  console.log('  Total sessions:', stats.total);
  console.log('  By agent:', stats.by_agent);
  console.log('  Top tasks:', stats.top_tasks);

  console.log('');

  // Demo 4: Rebuild index
  if (logger.sqliteAvailable) {
    console.log('🔄 Demo 4: Rebuild index...');
    logger.rebuildIndex();
  }

  logger.close();

  console.log('\n✅ Demo completed!');
  console.log('\nFiles created:');
  console.log('  📁 .claude/logs/sessions/hybrid.jsonl (JSONL storage)');
  if (logger.sqliteAvailable) {
    console.log('  📁 .claude/logs/index.db (SQLite index)');
  }
}

// Run demo if executed directly
if (require.main === module) {
  demo();
}

module.exports = HybridLogger;

