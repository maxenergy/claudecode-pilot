#!/usr/bin/env node

/**
 * Log Query Tool for Claude Code GPT-Pilot
 * 
 * Query and analyze development logs
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class LogQuery {
  constructor(logsDir = path.join(process.cwd(), '.claude/logs')) {
    this.logsDir = logsDir;
  }

  /**
   * Query session logs
   * 
   * @param {Object} filters - Filter criteria
   * @returns {Array} Matching sessions
   */
  querySessions(filters = {}) {
    const sessions = this.readLogs('sessions');
    return this.applyFilters(sessions, filters);
  }

  /**
   * Query operation logs
   * 
   * @param {Object} filters - Filter criteria
   * @returns {Array} Matching operations
   */
  queryOperations(filters = {}) {
    const operations = this.readLogs('operations');
    return this.applyFilters(operations, filters);
  }

  /**
   * Query error logs
   * 
   * @param {Object} filters - Filter criteria
   * @returns {Array} Matching errors
   */
  queryErrors(filters = {}) {
    const errors = this.readLogs('errors');
    return this.applyFilters(errors, filters);
  }

  /**
   * List all ADRs
   * 
   * @returns {Array} List of ADR files
   */
  listDecisions() {
    const decisionsDir = path.join(this.logsDir, 'decisions');
    if (!fs.existsSync(decisionsDir)) {
      return [];
    }

    return fs.readdirSync(decisionsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        filename: file,
        path: path.join(decisionsDir, file),
        number: parseInt(file.match(/ADR-(\d+)/)?.[1] || '0')
      }))
      .sort((a, b) => a.number - b.number);
  }

  /**
   * Generate report for a specific task
   * 
   * @param {string} taskId - Task ID
   * @returns {Object} Task report
   */
  generateReport(taskId) {
    const sessions = this.querySessions({ task_id: taskId });
    const operations = this.queryOperations({ task_id: taskId });
    const errors = this.queryErrors({ task_id: taskId });

    return {
      task_id: taskId,
      summary: {
        sessions_count: sessions.length,
        operations_count: operations.length,
        errors_count: errors.length,
        duration: this.calculateDuration(sessions, operations, errors)
      },
      timeline: this.buildTimeline(sessions, operations, errors),
      operations_by_type: this.groupByType(operations),
      errors_by_type: this.groupByType(errors, 'error_type')
    };
  }

  /**
   * Generate statistics
   * 
   * @returns {Object} Overall statistics
   */
  generateStats() {
    const sessions = this.readLogs('sessions');
    const operations = this.readLogs('operations');
    const errors = this.readLogs('errors');
    const decisions = this.listDecisions();

    return {
      total_sessions: sessions.length,
      total_operations: operations.length,
      total_errors: errors.length,
      total_decisions: decisions.length,
      agents: this.countByField(sessions, 'agent'),
      operation_types: this.countByField(operations, 'type'),
      error_types: this.countByField(errors, 'error_type'),
      tasks: this.countByField(sessions, 'task_id')
    };
  }

  /**
   * Read logs from JSONL files
   */
  readLogs(category) {
    const categoryDir = path.join(this.logsDir, category);
    const logs = [];

    if (!fs.existsSync(categoryDir)) {
      return logs;
    }

    // Recursively read all date directories
    const dateDirs = fs.readdirSync(categoryDir);
    dateDirs.forEach(dateDir => {
      const datePath = path.join(categoryDir, dateDir);
      if (!fs.statSync(datePath).isDirectory()) {
        return;
      }

      const logFile = path.join(datePath, `${category}.jsonl`);
      if (fs.existsSync(logFile)) {
        const lines = fs.readFileSync(logFile, 'utf8').split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            try {
              logs.push(JSON.parse(line));
            } catch (error) {
              console.error(`Failed to parse log line: ${error.message}`);
            }
          }
        });
      }
    });

    return logs;
  }

  /**
   * Apply filters to logs
   */
  applyFilters(logs, filters) {
    return logs.filter(log => {
      for (const [key, value] of Object.entries(filters)) {
        if (log[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Build timeline from events
   */
  buildTimeline(sessions, operations, errors) {
    const events = [
      ...sessions.map(s => ({ ...s, event_type: 'session' })),
      ...operations.map(o => ({ ...o, event_type: 'operation' })),
      ...errors.map(e => ({ ...e, event_type: 'error' }))
    ];

    return events.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  }

  /**
   * Group items by type
   */
  groupByType(items, typeField = 'type') {
    const grouped = {};
    items.forEach(item => {
      const type = item[typeField] || 'unknown';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });
    return grouped;
  }

  /**
   * Count items by field
   */
  countByField(items, field) {
    const counts = {};
    items.forEach(item => {
      const value = item[field] || 'unknown';
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  /**
   * Calculate duration
   */
  calculateDuration(sessions, operations, errors) {
    const allEvents = [...sessions, ...operations, ...errors];
    if (allEvents.length === 0) {
      return 0;
    }

    const timestamps = allEvents.map(e => new Date(e.timestamp).getTime());
    const start = Math.min(...timestamps);
    const end = Math.max(...timestamps);
    
    return Math.round((end - start) / 1000); // seconds
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

function printHelp() {
  console.log(`
Log Query CLI

Usage:
  log-query.js <command> [options]

Commands:
  sessions              List all sessions
  operations            List all operations
  errors                List all errors
  decisions             List all ADRs
  report <task-id>      Generate report for a task
  stats                 Show overall statistics

Options:
  --agent <name>        Filter by agent
  --task-id <id>        Filter by task ID
  --type <type>         Filter by type
  --format <format>     Output format (json|table|summary)

Examples:
  log-query.js sessions --agent developer
  log-query.js operations --task-id T001
  log-query.js report T001
  log-query.js stats
`);
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2).replace(/-/g, '_');
      const value = args[i + 1];
      parsed[key] = value;
      i++;
    }
  }
  return parsed;
}

function formatOutput(data, format = 'json') {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  } else if (format === 'summary') {
    if (Array.isArray(data)) {
      return `Found ${data.length} items`;
    }
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data, null, 2);
}

function cli() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    printHelp();
    return;
  }

  const query = new LogQuery();
  const options = parseArgs(args.slice(1));
  const format = options.format || 'json';

  try {
    switch (command) {
      case 'sessions': {
        const filters = {};
        if (options.agent) filters.agent = options.agent;
        if (options.task_id) filters.task_id = options.task_id;
        
        const sessions = query.querySessions(filters);
        console.log(formatOutput(sessions, format));
        break;
      }

      case 'operations': {
        const filters = {};
        if (options.agent) filters.agent = options.agent;
        if (options.task_id) filters.task_id = options.task_id;
        if (options.type) filters.type = options.type;
        
        const operations = query.queryOperations(filters);
        console.log(formatOutput(operations, format));
        break;
      }

      case 'errors': {
        const filters = {};
        if (options.agent) filters.agent = options.agent;
        if (options.task_id) filters.task_id = options.task_id;
        
        const errors = query.queryErrors(filters);
        console.log(formatOutput(errors, format));
        break;
      }

      case 'decisions': {
        const decisions = query.listDecisions();
        console.log(formatOutput(decisions, format));
        break;
      }

      case 'report': {
        const taskId = args[1];
        if (!taskId) {
          console.error('Error: Task ID required');
          printHelp();
          process.exit(1);
        }
        const report = query.generateReport(taskId);
        console.log(formatOutput(report, format));
        break;
      }

      case 'stats': {
        const stats = query.generateStats();
        console.log(formatOutput(stats, format));
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (require.main === module) {
  cli();
}

module.exports = LogQuery;

