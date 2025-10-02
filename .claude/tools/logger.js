#!/usr/bin/env node

/**
 * Development Logger for Claude Code GPT-Pilot
 * 
 * Records development sessions, operations, decisions, and errors
 * to structured JSONL files for analysis and debugging.
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DevelopmentLogger {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.logsDir = path.join(projectRoot, '.claude/logs');
    this.ensureDirectories();
  }

  /**
   * Ensure log directories exist
   */
  ensureDirectories() {
    const dirs = ['sessions', 'operations', 'decisions', 'errors'];
    dirs.forEach(dir => {
      const dirPath = path.join(this.logsDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  /**
   * Log a development session
   * 
   * @param {string} agent - Agent name (developer, architect, etc.)
   * @param {string} taskId - Task ID (e.g., T001)
   * @param {string} userInput - User's input/request
   * @param {string} aiResponse - AI's response
   * @param {Object} context - Additional context
   */
  logSession(agent, taskId, userInput, aiResponse, context = {}) {
    const log = {
      session_id: this.generateUUID(),
      timestamp: new Date().toISOString(),
      agent,
      task_id: taskId,
      user_input: userInput,
      ai_response: aiResponse,
      context
    };
    
    this.appendToFile('sessions', log);
    return log.session_id;
  }

  /**
   * Log a file or command operation
   * 
   * @param {string} type - Operation type (file_create, file_modify, command_run, etc.)
   * @param {Object} details - Operation details
   */
  logOperation(type, details) {
    const log = {
      operation_id: this.generateUUID(),
      timestamp: new Date().toISOString(),
      type,
      ...details
    };
    
    this.appendToFile('operations', log);
    return log.operation_id;
  }

  /**
   * Log an architecture decision (ADR)
   * 
   * @param {number} adrNumber - ADR number
   * @param {string} title - Decision title
   * @param {Object} content - Decision content
   */
  logDecision(adrNumber, title, content) {
    const filename = `ADR-${String(adrNumber).padStart(3, '0')}.md`;
    const filepath = path.join(this.logsDir, 'decisions', filename);
    
    const markdown = this.formatADR(adrNumber, title, content);
    fs.writeFileSync(filepath, markdown, 'utf8');
    
    return filepath;
  }

  /**
   * Log an error or exception
   * 
   * @param {string} agent - Agent name
   * @param {string} taskId - Task ID
   * @param {Object} error - Error object
   */
  logError(agent, taskId, error) {
    const log = {
      error_id: this.generateUUID(),
      timestamp: new Date().toISOString(),
      agent,
      task_id: taskId,
      error_type: error.type || 'unknown',
      error_message: error.message || String(error),
      stack_trace: error.stack || '',
      context: error.context || {},
      resolution: error.resolution || null
    };
    
    this.appendToFile('errors', log);
    return log.error_id;
  }

  /**
   * Format ADR as Markdown
   */
  formatADR(number, title, content) {
    const {
      date = new Date().toISOString().split('T')[0],
      status = '已接受',
      agent = 'unknown',
      task = 'N/A',
      background = '',
      decision = '',
      alternatives = [],
      consequences = { positive: [], negative: [] }
    } = content;

    return `# ADR-${String(number).padStart(3, '0')}: ${title}

**日期**: ${date}  
**状态**: ${status}  
**Agent**: ${agent}  
**任务**: ${task}

## 背景

${background}

## 决策

${decision}

## 替代方案

${alternatives.map((alt, i) => `${i + 1}. ${alt}`).join('\n')}

## 后果

### 正面

${consequences.positive.map(c => `- ${c}`).join('\n')}

### 负面

${consequences.negative.map(c => `- ${c}`).join('\n')}

---

*生成时间: ${new Date().toISOString()}*
`;
  }

  /**
   * Append log entry to JSONL file
   */
  appendToFile(category, data) {
    const date = new Date().toISOString().split('T')[0];
    const dir = path.join(this.logsDir, category, date);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filename = path.join(dir, `${category}.jsonl`);
    const line = JSON.stringify(data) + '\n';
    
    try {
      fs.appendFileSync(filename, line, 'utf8');
    } catch (error) {
      console.error(`Failed to write log: ${error.message}`);
    }
  }

  /**
   * Generate UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Calculate file hash
   */
  calculateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

function printHelp() {
  console.log(`
Development Logger CLI

Usage:
  logger.js <command> [options]

Commands:
  log-session       Log a development session
  log-operation     Log a file/command operation
  log-decision      Log an architecture decision
  log-error         Log an error

Options for log-session:
  --agent <name>           Agent name (required)
  --task-id <id>           Task ID (required)
  --user-input <text>      User input (required)
  --ai-response <text>     AI response (required)
  --context <json>         Additional context (optional)

Options for log-operation:
  --type <type>            Operation type (required)
  --file <path>            File path (optional)
  --command <cmd>          Command executed (optional)
  --result <text>          Operation result (optional)
  --agent <name>           Agent name (optional)
  --task-id <id>           Task ID (optional)

Options for log-decision:
  --number <num>           ADR number (required)
  --title <text>           Decision title (required)
  --background <text>      Background (required)
  --decision <text>        Decision made (required)
  --agent <name>           Agent name (optional)
  --task <id>              Task ID (optional)

Options for log-error:
  --agent <name>           Agent name (required)
  --task-id <id>           Task ID (required)
  --error-type <type>      Error type (required)
  --error-message <text>   Error message (required)
  --stack-trace <text>     Stack trace (optional)

Examples:
  logger.js log-session --agent developer --task-id T001 \\
    --user-input "Implement login" --ai-response "Starting TDD..."

  logger.js log-operation --type file_create --file src/auth.js \\
    --agent developer --task-id T001

  logger.js log-error --agent developer --task-id T001 \\
    --error-type test_failure --error-message "Test failed"
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

function cli() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    printHelp();
    return;
  }

  const logger = new DevelopmentLogger();
  const options = parseArgs(args.slice(1));

  try {
    switch (command) {
      case 'log-session': {
        const { agent, task_id, user_input, ai_response, context } = options;
        if (!agent || !task_id || !user_input || !ai_response) {
          console.error('Error: Missing required options');
          printHelp();
          process.exit(1);
        }
        const sessionId = logger.logSession(
          agent,
          task_id,
          user_input,
          ai_response,
          context ? JSON.parse(context) : {}
        );
        console.log(`✅ Session logged: ${sessionId}`);
        break;
      }

      case 'log-operation': {
        const { type, ...details } = options;
        if (!type) {
          console.error('Error: Missing operation type');
          printHelp();
          process.exit(1);
        }
        const opId = logger.logOperation(type, details);
        console.log(`✅ Operation logged: ${opId}`);
        break;
      }

      case 'log-decision': {
        const { number, title, background, decision, agent, task } = options;
        if (!number || !title || !background || !decision) {
          console.error('Error: Missing required options');
          printHelp();
          process.exit(1);
        }
        const filepath = logger.logDecision(parseInt(number), title, {
          background,
          decision,
          agent,
          task
        });
        console.log(`✅ Decision logged: ${filepath}`);
        break;
      }

      case 'log-error': {
        const { agent, task_id, error_type, error_message, stack_trace } = options;
        if (!agent || !task_id || !error_type || !error_message) {
          console.error('Error: Missing required options');
          printHelp();
          process.exit(1);
        }
        const errorId = logger.logError(agent, task_id, {
          type: error_type,
          message: error_message,
          stack: stack_trace || ''
        });
        console.log(`✅ Error logged: ${errorId}`);
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

module.exports = DevelopmentLogger;

