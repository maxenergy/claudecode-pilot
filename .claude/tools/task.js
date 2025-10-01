#!/usr/bin/env node

/**
 * Task Management Tool for Claude Code GPT-Pilot v2.0
 *
 * Enhanced with hierarchical task structure support for large projects
 *
 * Features:
 * - Flat structure for small projects (<50 tasks)
 * - Hierarchical structure for large projects (>=50 tasks)
 * - Automatic structure detection
 * - Backward compatibility with v1.0
 *
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const TASK_STATUS_FILE = 'task_status.json';
const TASKS_DIR = '.claude/tasks';
const PROJECT_ROOT = process.cwd();
const HIERARCHICAL_THRESHOLD = 50; // Use hierarchical structure if tasks >= 50

// ============================================================================
// Structure Detection
// ============================================================================

/**
 * Detect if project uses hierarchical task structure
 *
 * @returns {boolean} True if hierarchical, false if flat
 */
function isHierarchical() {
  const filePath = path.join(PROJECT_ROOT, TASK_STATUS_FILE);

  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // Check if it has task_groups (hierarchical) or tasks (flat)
    return data.task_groups !== undefined;
  } catch (error) {
    return false;
  }
}

/**
 * Ensure tasks directory exists
 */
function ensureTasksDir() {
  const tasksDir = path.join(PROJECT_ROOT, TASKS_DIR);
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
  }
}

// ============================================================================
// Flat Structure Functions (v1.0 compatibility)
// ============================================================================

/**
 * Load flat task status
 *
 * @returns {Object} Task status object
 */
function loadFlatTaskStatus() {
  const filePath = path.join(PROJECT_ROOT, TASK_STATUS_FILE);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Task status file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const taskStatus = JSON.parse(content);

  if (!taskStatus.tasks || !Array.isArray(taskStatus.tasks)) {
    throw new Error('Invalid task status format: missing tasks array');
  }

  return taskStatus;
}

/**
 * Save flat task status
 *
 * @param {Object} taskStatus - Task status object
 */
function saveFlatTaskStatus(taskStatus) {
  const filePath = path.join(PROJECT_ROOT, TASK_STATUS_FILE);
  taskStatus.updated_at = new Date().toISOString();
  const content = JSON.stringify(taskStatus, null, 2);
  fs.writeFileSync(filePath, content, 'utf8');
}

// ============================================================================
// Hierarchical Structure Functions (v2.0)
// ============================================================================

/**
 * Load hierarchical task status
 *
 * @returns {Object} Complete task status with all groups loaded
 */
function loadHierarchicalTaskStatus() {
  const indexPath = path.join(PROJECT_ROOT, TASK_STATUS_FILE);

  if (!fs.existsSync(indexPath)) {
    throw new Error(`Task status file not found: ${indexPath}`);
  }

  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const index = JSON.parse(indexContent);

  if (!index.task_groups || !Array.isArray(index.task_groups)) {
    throw new Error('Invalid hierarchical task status: missing task_groups');
  }

  // Load all task group files
  const allTasks = [];

  for (const group of index.task_groups) {
    const groupPath = path.join(PROJECT_ROOT, group.file);

    if (fs.existsSync(groupPath)) {
      const groupContent = fs.readFileSync(groupPath, 'utf8');
      const groupData = JSON.parse(groupContent);

      if (groupData.tasks && Array.isArray(groupData.tasks)) {
        allTasks.push(...groupData.tasks);
      }
    }
  }

  // Return unified structure
  return {
    project: index.project,
    total_tasks: index.total_tasks,
    task_groups: index.task_groups,
    tasks: allTasks, // Flattened for compatibility
    updated_at: index.updated_at
  };
}

/**
 * Save hierarchical task status
 *
 * @param {Object} taskStatus - Task status object with task_groups
 */
function saveHierarchicalTaskStatus(taskStatus) {
  ensureTasksDir();

  const indexPath = path.join(PROJECT_ROOT, TASK_STATUS_FILE);

  // Update index file
  const index = {
    project: taskStatus.project,
    total_tasks: taskStatus.total_tasks,
    task_groups: taskStatus.task_groups,
    updated_at: new Date().toISOString()
  };

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

  // Save each task group file
  for (const group of taskStatus.task_groups) {
    const groupPath = path.join(PROJECT_ROOT, group.file);
    const groupDir = path.dirname(groupPath);

    if (!fs.existsSync(groupDir)) {
      fs.mkdirSync(groupDir, { recursive: true });
    }

    // Find tasks for this group
    const groupTasks = taskStatus.tasks.filter(t => t.group_id === group.id);

    const groupData = {
      group_id: group.id,
      group_name: group.name,
      tasks: groupTasks,
      updated_at: new Date().toISOString()
    };

    fs.writeFileSync(groupPath, JSON.stringify(groupData, null, 2), 'utf8');
  }
}

/**
 * Load task group file
 *
 * @param {string} groupId - Task group ID
 * @returns {Object} Task group data
 */
function loadTaskGroup(groupId) {
  const indexPath = path.join(PROJECT_ROOT, TASK_STATUS_FILE);
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const index = JSON.parse(indexContent);

  const group = index.task_groups.find(g => g.id === groupId);
  if (!group) {
    throw new Error(`Task group not found: ${groupId}`);
  }

  const groupPath = path.join(PROJECT_ROOT, group.file);
  const groupContent = fs.readFileSync(groupPath, 'utf8');
  return JSON.parse(groupContent);
}

/**
 * Save task group file
 *
 * @param {string} groupId - Task group ID
 * @param {Object} groupData - Task group data
 */
function saveTaskGroup(groupId, groupData) {
  const indexPath = path.join(PROJECT_ROOT, TASK_STATUS_FILE);
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const index = JSON.parse(indexContent);

  const group = index.task_groups.find(g => g.id === groupId);
  if (!group) {
    throw new Error(`Task group not found: ${groupId}`);
  }

  groupData.updated_at = new Date().toISOString();
  const groupPath = path.join(PROJECT_ROOT, group.file);
  fs.writeFileSync(groupPath, JSON.stringify(groupData, null, 2), 'utf8');

  // Update index
  group.task_count = groupData.tasks.length;
  group.status = calculateGroupStatus(groupData.tasks);
  index.updated_at = new Date().toISOString();
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
}

/**
 * Calculate group status based on tasks
 *
 * @param {Array} tasks - Array of tasks
 * @returns {string} Group status
 */
function calculateGroupStatus(tasks) {
  if (tasks.every(t => t.status === 'completed')) return 'completed';
  if (tasks.some(t => t.status === 'in_progress')) return 'in_progress';
  if (tasks.some(t => t.status === 'completed')) return 'in_progress';
  return 'not_started';
}

// ============================================================================
// Unified API (Auto-detect structure)
// ============================================================================

/**
 * Load task status (auto-detect structure)
 *
 * @returns {Object} Task status object
 */
function loadTaskStatus() {
  try {
    if (isHierarchical()) {
      return loadHierarchicalTaskStatus();
    } else {
      return loadFlatTaskStatus();
    }
  } catch (error) {
    throw new Error(`Failed to load task status: ${error.message}`);
  }
}

/**
 * Save task status (auto-detect structure)
 *
 * @param {Object} taskStatus - Task status object
 */
function saveTaskStatus(taskStatus) {
  try {
    if (taskStatus.task_groups) {
      saveHierarchicalTaskStatus(taskStatus);
    } else {
      saveFlatTaskStatus(taskStatus);
    }
  } catch (error) {
    throw new Error(`Failed to save task status: ${error.message}`);
  }
}




/**
 * Get task by ID (works with both structures)
 *
 * @param {string} taskId - Task ID
 * @returns {Object|null} Task object or null
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

/**
 * Update task status
 *
 * @param {string} taskId - Task ID
 * @param {string} newStatus - New status
 * @returns {boolean} Success
 */
function updateTaskStatus(taskId, newStatus) {
  try {
    const taskStatus = loadTaskStatus();
    const task = taskStatus.tasks.find(t => t.id === taskId);

    if (!task) {
      console.error(`Task not found: ${taskId}`);
      return false;
    }

    task.status = newStatus;
    task.updated_at = new Date().toISOString();

    saveTaskStatus(taskStatus);
    return true;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error.message);
    return false;
  }
}

/**
 * Check if task dependencies are met
 *
 * @param {string} taskId - Task ID
 * @returns {Object} {canExecute: boolean, blockedBy: Array}
 */
function checkDependencies(taskId) {
  try {
    const taskStatus = loadTaskStatus();
    const task = taskStatus.tasks.find(t => t.id === taskId);

    if (!task) {
      return { canExecute: false, blockedBy: [], error: 'Task not found' };
    }

    if (!task.dependencies || task.dependencies.length === 0) {
      return { canExecute: true, blockedBy: [] };
    }

    const blockedBy = [];

    for (const depId of task.dependencies) {
      const depTask = taskStatus.tasks.find(t => t.id === depId);

      if (!depTask) {
        blockedBy.push({ id: depId, reason: 'Dependency not found' });
      } else if (depTask.status !== 'completed') {
        blockedBy.push({ id: depId, status: depTask.status, title: depTask.title });
      }
    }

    return {
      canExecute: blockedBy.length === 0,
      blockedBy: blockedBy
    };
  } catch (error) {
    return { canExecute: false, blockedBy: [], error: error.message };
  }
}

/**
 * Get all executable tasks (dependencies met, not completed)
 *
 * @returns {Array} Array of executable tasks
 */
function getAllExecutableTasks() {
  try {
    const taskStatus = loadTaskStatus();
    const executable = [];

    for (const task of taskStatus.tasks) {
      if (task.status === 'completed') continue;

      const depCheck = checkDependencies(task.id);
      if (depCheck.canExecute) {
        executable.push(task);
      }
    }

    return executable;
  } catch (error) {
    console.error('Error getting executable tasks:', error.message);
    return [];
  }
}

/**
 * Get next task to execute
 *
 * @returns {Object|null} Next task or null
 */
function getNextTask() {
  const executable = getAllExecutableTasks();

  if (executable.length === 0) {
    return null;
  }

  // Sort by priority (if exists) or by ID
  executable.sort((a, b) => {
    if (a.priority && b.priority) {
      return b.priority - a.priority;
    }
    return a.id.localeCompare(b.id);
  });

  return executable[0];
}

/**
 * List tasks by status
 *
 * @param {string} status - Status filter (optional)
 * @returns {Array} Filtered tasks
 */
function listTasks(status = null) {
  try {
    const taskStatus = loadTaskStatus();

    if (!status) {
      return taskStatus.tasks;
    }

    return taskStatus.tasks.filter(t => t.status === status);
  } catch (error) {
    console.error('Error listing tasks:', error.message);
    return [];
  }
}

/**
 * Get project statistics
 *
 * @returns {Object} Project stats
 */
function getProjectStats() {
  try {
    const taskStatus = loadTaskStatus();
    const tasks = taskStatus.tasks;

    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      blocked: 0
    };

    // Count blocked tasks
    for (const task of tasks) {
      if (task.status !== 'completed') {
        const depCheck = checkDependencies(task.id);
        if (!depCheck.canExecute) {
          stats.blocked++;
        }
      }
    }

    stats.completion_rate = ((stats.completed / stats.total) * 100).toFixed(1);

    return stats;
  } catch (error) {
    console.error('Error getting project stats:', error.message);
    return null;
  }
}


// ============================================================================
// CLI Interface
// ============================================================================

function printHelp() {
  console.log(`
Task Management Tool v2.0 - Claude Code GPT-Pilot

Usage: node task.js <command> [arguments]

Commands:
  list [status]          List all tasks or filter by status
  next                   Get next executable task
  executable             List all executable tasks
  check <task-id>        Check if task can be executed
  update <task-id> <status>  Update task status
  stats                  Show project statistics
  info <task-id>         Show task details
  help                   Show this help message

Status values:
  pending, in_progress, completed, blocked

Examples:
  node task.js list
  node task.js list pending
  node task.js next
  node task.js check T001
  node task.js update T001 completed
  node task.js stats
`);
}

function cli() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case 'list': {
        const status = args[1];
        const tasks = listTasks(status);
        console.log(JSON.stringify(tasks, null, 2));
        break;
      }

      case 'next': {
        const task = getNextTask();
        if (task) {
          console.log(JSON.stringify(task, null, 2));
        } else {
          console.log('No executable tasks found');
        }
        break;
      }

      case 'executable': {
        const tasks = getAllExecutableTasks();
        console.log(JSON.stringify(tasks, null, 2));
        break;
      }

      case 'check': {
        const taskId = args[1];
        if (!taskId) {
          console.error('Error: task-id required');
          process.exit(1);
        }
        const result = checkDependencies(taskId);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'update': {
        const taskId = args[1];
        const newStatus = args[2];
        if (!taskId || !newStatus) {
          console.error('Error: task-id and status required');
          process.exit(1);
        }
        const success = updateTaskStatus(taskId, newStatus);
        if (success) {
          console.log(`✅ Task ${taskId} updated to ${newStatus}`);
        } else {
          console.error(`❌ Failed to update task ${taskId}`);
          process.exit(1);
        }
        break;
      }

      case 'stats': {
        const stats = getProjectStats();
        if (stats) {
          console.log(JSON.stringify(stats, null, 2));
        } else {
          console.error('Failed to get project stats');
          process.exit(1);
        }
        break;
      }

      case 'info': {
        const taskId = args[1];
        if (!taskId) {
          console.error('Error: task-id required');
          process.exit(1);
        }
        const task = getTaskById(taskId);
        if (task) {
          console.log(JSON.stringify(task, null, 2));
        } else {
          console.error(`Task not found: ${taskId}`);
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // Structure detection
  isHierarchical,

  // Load/Save
  loadTaskStatus,
  saveTaskStatus,
  loadTaskGroup,
  saveTaskGroup,

  // Task operations
  getTaskById,
  updateTaskStatus,
  checkDependencies,
  getAllExecutableTasks,
  getNextTask,
  listTasks,
  getProjectStats,

  // Constants
  HIERARCHICAL_THRESHOLD
};

// Run CLI if executed directly
if (require.main === module) {
  cli();
}

