#!/usr/bin/env node

/**
 * Task Management Tool for Claude Code GPT-Pilot
 * 
 * This tool provides task management functionality including:
 * - Loading and saving task status
 * - Checking task dependencies
 * - Getting executable tasks
 * - Updating task status
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const TASK_STATUS_FILE = 'task_status.json';
const PROJECT_ROOT = process.cwd();

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Load task status from task_status.json
 * 
 * @returns {Object} Task status object containing project info and tasks array
 * @throws {Error} If file doesn't exist or JSON is invalid
 */
function loadTaskStatus() {
  const filePath = path.join(PROJECT_ROOT, TASK_STATUS_FILE);
  
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Task status file not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const taskStatus = JSON.parse(content);
    
    // Validate structure
    if (!taskStatus.tasks || !Array.isArray(taskStatus.tasks)) {
      throw new Error('Invalid task status format: missing tasks array');
    }
    
    return taskStatus;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in task status file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Save task status to task_status.json
 * 
 * @param {Object} taskStatus - Task status object to save
 * @throws {Error} If save operation fails
 */
function saveTaskStatus(taskStatus) {
  const filePath = path.join(PROJECT_ROOT, TASK_STATUS_FILE);
  
  try {
    // Update timestamp
    taskStatus.updated_at = new Date().toISOString();
    
    // Write with pretty formatting
    const content = JSON.stringify(taskStatus, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to save task status: ${error.message}`);
  }
}

/**
 * Get task by ID
 * 
 * @param {string} taskId - Task ID (e.g., "T001")
 * @returns {Object|null} Task object or null if not found
 */
function getTaskById(taskId) {
  try {
    const taskStatus = loadTaskStatus();
    const task = taskStatus.tasks.find(t => t.id === taskId);
    return task || null;
  } catch (error) {
    console.error(`Error getting task ${taskId}:`, error.message);
    return null;
  }
}

// ============================================================================
// Dependency Management
// ============================================================================

/**
 * Check if a task's dependencies are satisfied
 *
 * @param {string} taskId - Task ID to check
 * @returns {Object} Result object with ok, missing, and message properties
 */
function checkDependencies(taskId) {
  try {
    const taskStatus = loadTaskStatus();
    const task = taskStatus.tasks.find(t => t.id === taskId);

    if (!task) {
      return {
        ok: false,
        missing: [],
        message: `Task ${taskId} not found`
      };
    }

    const dependencies = task.dependencies || [];

    // No dependencies means OK
    if (dependencies.length === 0) {
      return {
        ok: true,
        missing: [],
        message: `Task ${taskId} has no dependencies`
      };
    }

    // Check each dependency
    const missing = [];
    for (const depId of dependencies) {
      const depTask = taskStatus.tasks.find(t => t.id === depId);

      if (!depTask) {
        missing.push(depId);
      } else if (depTask.status !== 'completed') {
        missing.push(depId);
      }
    }

    if (missing.length > 0) {
      return {
        ok: false,
        missing: missing,
        message: `Task ${taskId} depends on: ${missing.join(', ')} (not completed)`
      };
    }

    return {
      ok: true,
      missing: [],
      message: `All dependencies satisfied for task ${taskId}`
    };
  } catch (error) {
    return {
      ok: false,
      missing: [],
      message: `Error checking dependencies: ${error.message}`
    };
  }
}

/**
 * Detect circular dependencies
 *
 * @param {string} taskId - Task ID to check
 * @param {Set} visited - Set of visited task IDs
 * @returns {boolean} True if circular dependency detected
 */
function hasCircularDependency(taskId, visited = new Set()) {
  if (visited.has(taskId)) {
    return true;
  }

  visited.add(taskId);

  const task = getTaskById(taskId);
  if (!task || !task.dependencies) {
    return false;
  }

  for (const depId of task.dependencies) {
    if (hasCircularDependency(depId, new Set(visited))) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Task Filtering and Sorting
// ============================================================================

/**
 * Get all executable tasks (pending with satisfied dependencies)
 *
 * @returns {Array} Array of executable tasks
 */
function getAllExecutableTasks() {
  try {
    const taskStatus = loadTaskStatus();

    // Filter pending tasks
    const pendingTasks = taskStatus.tasks.filter(t => t.status === 'pending');

    // Check dependencies for each pending task
    const executableTasks = pendingTasks.filter(task => {
      const depCheck = checkDependencies(task.id);
      return depCheck.ok;
    });

    // Sort by priority (高 > 中 > 低)
    const priorityOrder = { '高': 1, '中': 2, '低': 3 };
    executableTasks.sort((a, b) => {
      const priorityA = priorityOrder[a.priority] || 999;
      const priorityB = priorityOrder[b.priority] || 999;
      return priorityA - priorityB;
    });

    return executableTasks;
  } catch (error) {
    console.error('Error getting executable tasks:', error.message);
    return [];
  }
}

/**
 * Get the next executable task
 *
 * @returns {Object|null} Next task or null if none available
 */
function getNextExecutableTask() {
  const executableTasks = getAllExecutableTasks();
  return executableTasks.length > 0 ? executableTasks[0] : null;
}

// ============================================================================
// Command Line Interface
// ============================================================================

/**
 * Parse command line arguments
 * 
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  return {
    command: args[0] || 'help',
    params: args.slice(1)
  };
}

// ============================================================================
// Task Status Management
// ============================================================================

/**
 * Update task status
 *
 * @param {string} taskId - Task ID
 * @param {string} status - New status (pending, in-progress, completed, blocked)
 * @returns {boolean} True if update successful
 */
function updateTaskStatus(taskId, status) {
  try {
    const taskStatus = loadTaskStatus();
    const task = taskStatus.tasks.find(t => t.id === taskId);

    if (!task) {
      console.error(`Task ${taskId} not found`);
      return false;
    }

    const validStatuses = ['pending', 'in-progress', 'completed', 'blocked'];
    if (!validStatuses.includes(status)) {
      console.error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      return false;
    }

    const oldStatus = task.status;
    task.status = status;
    task.updated_at = new Date().toISOString();

    if (status === 'completed') {
      task.completed_at = new Date().toISOString();
    }

    // Update counters
    taskStatus.completed_tasks = taskStatus.tasks.filter(t => t.status === 'completed').length;
    taskStatus.in_progress_tasks = taskStatus.tasks.filter(t => t.status === 'in-progress').length;
    taskStatus.pending_tasks = taskStatus.tasks.filter(t => t.status === 'pending').length;

    saveTaskStatus(taskStatus);

    console.log(`✅ Updated ${taskId}: ${oldStatus} → ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating task status:', error.message);
    return false;
  }
}

/**
 * List tasks with optional filtering
 *
 * @param {string} filter - Status filter (pending, in-progress, completed, blocked, all)
 * @returns {Array} Filtered tasks
 */
function listTasks(filter = 'all') {
  try {
    const taskStatus = loadTaskStatus();
    let tasks = taskStatus.tasks;

    if (filter !== 'all') {
      tasks = tasks.filter(t => t.status === filter);
    }

    return tasks;
  } catch (error) {
    console.error('Error listing tasks:', error.message);
    return [];
  }
}

// ============================================================================
// Display Functions
// ============================================================================

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Task Management Tool - Claude Code GPT-Pilot

Usage:
  node task.js <command> [options]

Commands:
  next                     Show next executable task
  list [status]            List all tasks (optionally filter by status)
  check <taskId>           Check dependencies for a task
  update <taskId> <status> Update task status
  executable               Show all executable tasks
  help                     Show this help message

Examples:
  node task.js next
  node task.js list
  node task.js list pending
  node task.js check T001
  node task.js update T001 completed
  node task.js executable

Task Status Values:
  pending      - Task not started
  in-progress  - Task currently being worked on
  completed    - Task finished
  blocked      - Task blocked by dependencies
`);
}

/**
 * Display task details
 *
 * @param {Object} task - Task object
 */
function displayTask(task) {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ${task.id}: ${task.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

状态: ${task.status}
优先级: ${task.priority}
预计时间: ${task.estimated_hours}小时
依赖: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : '无'}

描述:
${task.description}

验收标准:
${task.acceptance_criteria.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}
`);
}

/**
 * Display task list
 *
 * @param {Array} tasks - Array of tasks
 * @param {string} title - List title
 */
function displayTaskList(tasks, title = '任务列表') {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (tasks.length === 0) {
    console.log('  (无任务)');
    return;
  }

  tasks.forEach(task => {
    const statusIcon = {
      'pending': '⏳',
      'in-progress': '🔄',
      'completed': '✅',
      'blocked': '🚫'
    }[task.status] || '❓';

    console.log(`  ${statusIcon} ${task.id} - ${task.title} (${task.estimated_hours}h)`);
    if (task.dependencies.length > 0) {
      console.log(`     依赖: ${task.dependencies.join(', ')}`);
    }
  });

  console.log('');
}

/**
 * Handle errors gracefully
 * 
 * @param {Error} error - Error object
 */
function handleError(error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Main function
 */
function main() {
  try {
    const { command, params } = parseArgs();

    switch (command) {
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      case 'next':
        // Show next executable task
        {
          const nextTask = getNextExecutableTask();
          if (nextTask) {
            displayTask(nextTask);
            console.log('开始开发:');
            console.log(`  /developer ${nextTask.id}      (手动模式)`);
            console.log(`  /developer-auto ${nextTask.id} (自动化模式)`);
          } else {
            console.log('✅ 没有可执行的任务');
            const taskStatus = loadTaskStatus();
            const pendingTasks = taskStatus.tasks.filter(t => t.status === 'pending');
            if (pendingTasks.length > 0) {
              console.log('\n⚠️ 有待执行任务，但依赖未满足:');
              pendingTasks.forEach(task => {
                const depCheck = checkDependencies(task.id);
                if (!depCheck.ok) {
                  console.log(`  ${task.id}: ${depCheck.message}`);
                }
              });
            }
          }
        }
        break;

      case 'list':
        // List tasks
        {
          const filter = params[0] || 'all';
          const tasks = listTasks(filter);
          const taskStatus = loadTaskStatus();

          console.log(`
📊 任务统计
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
总任务数: ${taskStatus.total_tasks}
✅ 已完成: ${taskStatus.completed_tasks} (${Math.round(taskStatus.completed_tasks / taskStatus.total_tasks * 100)}%)
🔄 进行中: ${taskStatus.in_progress_tasks}
⏳ 待开始: ${taskStatus.pending_tasks}
`);

          if (filter === 'all') {
            const completed = tasks.filter(t => t.status === 'completed');
            const inProgress = tasks.filter(t => t.status === 'in-progress');
            const pending = tasks.filter(t => t.status === 'pending');
            const blocked = tasks.filter(t => t.status === 'blocked');

            if (completed.length > 0) displayTaskList(completed, '✅ 已完成任务');
            if (inProgress.length > 0) displayTaskList(inProgress, '🔄 进行中任务');
            if (pending.length > 0) displayTaskList(pending, '⏳ 待开始任务');
            if (blocked.length > 0) displayTaskList(blocked, '🚫 阻塞任务');
          } else {
            displayTaskList(tasks, `${filter} 任务`);
          }
        }
        break;

      case 'check':
        // Check dependencies
        {
          const taskId = params[0];
          if (!taskId) {
            console.error('❌ 请指定任务ID');
            console.log('用法: node task.js check <taskId>');
            process.exit(1);
          }

          const result = checkDependencies(taskId);
          console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
依赖检查: ${taskId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${result.ok ? '✅' : '❌'} ${result.message}
`);

          if (!result.ok && result.missing.length > 0) {
            console.log('缺失的依赖:');
            result.missing.forEach(depId => {
              const depTask = getTaskById(depId);
              if (depTask) {
                console.log(`  - ${depId}: ${depTask.title} (${depTask.status})`);
              } else {
                console.log(`  - ${depId}: (任务不存在)`);
              }
            });
          }

          // Check for circular dependencies
          if (hasCircularDependency(taskId)) {
            console.log('\n⚠️ 警告: 检测到循环依赖！');
          }
        }
        break;

      case 'update':
        // Update task status
        {
          const taskId = params[0];
          const status = params[1];

          if (!taskId || !status) {
            console.error('❌ 请指定任务ID和状态');
            console.log('用法: node task.js update <taskId> <status>');
            console.log('状态: pending, in-progress, completed, blocked');
            process.exit(1);
          }

          updateTaskStatus(taskId, status);
        }
        break;

      case 'executable':
        // Show all executable tasks
        {
          const executableTasks = getAllExecutableTasks();
          displayTaskList(executableTasks, '可执行任务');

          if (executableTasks.length > 0) {
            console.log('开始自动化执行:');
            console.log(`  /developer-auto`);
          }
        }
        break;

      case 'test':
        // Test basic functionality
        console.log('Testing task.js...');
        const taskStatus = loadTaskStatus();
        console.log(`✅ Loaded ${taskStatus.tasks.length} tasks`);
        console.log(`Project: ${taskStatus.project}`);
        break;

      default:
        console.log(`Unknown command: ${command}`);
        console.log('Run "node task.js help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    handleError(error);
  }
}

// Run main if executed directly
if (require.main === module) {
  main();
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  loadTaskStatus,
  saveTaskStatus,
  getTaskById,
  checkDependencies,
  hasCircularDependency,
  getAllExecutableTasks,
  getNextExecutableTask,
  updateTaskStatus,
  listTasks
};

