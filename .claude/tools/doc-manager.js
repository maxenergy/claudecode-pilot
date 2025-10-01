#!/usr/bin/env node

/**
 * Document Manager Tool for Claude Code GPT-Pilot v2.0
 * 
 * Manages document metadata, versioning, change detection, and backups
 * 
 * Features:
 * - Parse and update document metadata
 * - Detect manual changes
 * - Version management
 * - Automatic backups
 * - Dependency tracking
 * 
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ROOT = process.cwd();
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
const BACKUPS_DIR = path.join(PROJECT_ROOT, '.claude', 'backups');
const CHANGES_DIR = path.join(PROJECT_ROOT, '.claude', 'changes');

// Document types and their default metadata
const DOCUMENT_TYPES = {
  'product_requirements.md': {
    generated_by: 'product-owner',
    dependencies: [],
    triggers_regeneration: ['architecture.md', 'tasks.md']
  },
  'architecture.md': {
    generated_by: 'architect',
    dependencies: ['product_requirements.md'],
    triggers_regeneration: ['tasks.md']
  },
  'tasks.md': {
    generated_by: 'tech-lead',
    dependencies: ['product_requirements.md', 'architecture.md'],
    triggers_regeneration: []
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Ensure directory exists
 */
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Calculate file checksum
 */
function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Get current timestamp in ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Format timestamp for display
 */
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Increment version number
 */
function incrementVersion(version, type = 'minor') {
  const parts = version.split('.').map(Number);
  
  if (type === 'major') {
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
  } else if (type === 'minor') {
    parts[1]++;
    parts[2] = 0;
  } else if (type === 'patch') {
    parts[2]++;
  }
  
  return parts.join('.');
}

// ============================================================================
// Metadata Parsing and Writing
// ============================================================================

/**
 * Parse document metadata from frontmatter
 * 
 * @param {string} content - Document content
 * @returns {Object} Parsed metadata and content
 */
function parseDocument(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return {
      metadata: null,
      content: content,
      hasFrontmatter: false
    };
  }
  
  const frontmatter = match[1];
  const body = match[2];
  
  // Parse YAML-like frontmatter
  const metadata = {};
  const lines = frontmatter.split('\n');
  
  let currentKey = null;
  let currentArray = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Array item
    if (trimmed.startsWith('- ')) {
      if (currentArray) {
        const value = trimmed.substring(2).trim();
        // Handle object in array
        if (value.includes(':')) {
          const [k, v] = value.split(':').map(s => s.trim());
          if (!currentArray[currentArray.length - 1] || typeof currentArray[currentArray.length - 1] !== 'object') {
            currentArray.push({});
          }
          currentArray[currentArray.length - 1][k] = v.replace(/^["']|["']$/g, '');
        } else {
          currentArray.push(value.replace(/^["']|["']$/g, ''));
        }
      }
      continue;
    }
    
    // Key-value pair
    if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      
      currentKey = key;
      
      if (value === '') {
        // Array or object follows
        currentArray = [];
        metadata[key] = currentArray;
      } else {
        // Simple value
        metadata[key] = value.replace(/^["']|["']$/g, '');
        currentArray = null;
      }
    }
  }
  
  return {
    metadata,
    content: body,
    hasFrontmatter: true
  };
}

/**
 * Serialize metadata to frontmatter
 * 
 * @param {Object} metadata - Metadata object
 * @returns {string} YAML frontmatter
 */
function serializeMetadata(metadata) {
  let yaml = '---\n';
  
  for (const [key, value] of Object.entries(metadata)) {
    if (Array.isArray(value)) {
      yaml += `${key}:\n`;
      for (const item of value) {
        if (typeof item === 'object') {
          yaml += '  -\n';
          for (const [k, v] of Object.entries(item)) {
            yaml += `    ${k}: ${v}\n`;
          }
        } else {
          yaml += `  - ${item}\n`;
        }
      }
    } else {
      yaml += `${key}: ${value}\n`;
    }
  }
  
  yaml += '---\n';
  return yaml;
}

/**
 * Create default metadata for a document
 * 
 * @param {string} filename - Document filename
 * @param {string} content - Document content
 * @returns {Object} Default metadata
 */
function createDefaultMetadata(filename, content) {
  const docType = DOCUMENT_TYPES[filename] || {};
  
  return {
    version: '1.0',
    generated_by: docType.generated_by || 'unknown',
    generated_at: getCurrentTimestamp(),
    last_modified: getCurrentTimestamp(),
    modified_by: 'agent',
    manual_sections: [],
    dependencies: docType.dependencies || [],
    triggers_regeneration: docType.triggers_regeneration || [],
    checksum: calculateChecksum(content)
  };
}

/**
 * Update document with metadata
 * 
 * @param {string} filePath - Path to document
 * @param {Object} metadata - Metadata to add/update
 * @returns {boolean} Success
 */
function updateDocumentMetadata(filePath, metadata) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseDocument(content);
    
    // Merge metadata
    const newMetadata = {
      ...(parsed.metadata || {}),
      ...metadata,
      last_modified: getCurrentTimestamp(),
      checksum: calculateChecksum(parsed.content)
    };
    
    // Reconstruct document
    const newContent = serializeMetadata(newMetadata) + '\n' + parsed.content;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error updating metadata for ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Add metadata to document if missing
 * 
 * @param {string} filePath - Path to document
 * @returns {boolean} Success
 */
function addMetadataIfMissing(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseDocument(content);
    
    if (parsed.hasFrontmatter) {
      console.log(`✅ Document already has metadata: ${path.basename(filePath)}`);
      return true;
    }
    
    const filename = path.basename(filePath);
    const metadata = createDefaultMetadata(filename, content);
    
    const newContent = serializeMetadata(metadata) + '\n' + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✅ Added metadata to: ${filename}`);
    return true;
  } catch (error) {
    console.error(`Error adding metadata to ${filePath}:`, error.message);
    return false;
  }
}

// ============================================================================
// Change Detection
// ============================================================================

/**
 * Detect if document has manual changes
 * 
 * @param {string} filePath - Path to document
 * @returns {Object} Change detection result
 */
function detectChanges(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseDocument(content);
    
    if (!parsed.metadata) {
      return {
        error: 'No metadata found',
        hasMetadata: false
      };
    }
    
    const metadata = parsed.metadata;
    const currentChecksum = calculateChecksum(parsed.content);
    
    // Check if content has changed since last generation
    const hasContentChanged = metadata.checksum !== currentChecksum;
    
    // Check if modified by human
    const hasManualChanges = metadata.modified_by === 'human';
    
    // Check manual sections
    const manualSections = metadata.manual_sections || [];
    
    return {
      hasMetadata: true,
      hasContentChanged,
      hasManualChanges,
      manualSections,
      version: metadata.version,
      lastModified: metadata.last_modified,
      modifiedBy: metadata.modified_by,
      checksum: {
        stored: metadata.checksum,
        current: currentChecksum
      }
    };
  } catch (error) {
    return {
      error: error.message,
      hasMetadata: false
    };
  }
}

// ============================================================================
// Backup Management
// ============================================================================

/**
 * Create backup of document
 * 
 * @param {string} filePath - Path to document
 * @returns {string|null} Backup file path or null
 */
function backupDocument(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseDocument(content);
    const filename = path.basename(filePath);
    const filenameWithoutExt = filename.replace(/\.md$/, '');
    
    // Create backup directory
    const backupDir = path.join(BACKUPS_DIR, filenameWithoutExt);
    ensureDirectory(backupDir);
    
    // Generate backup filename
    const version = parsed.metadata?.version || '1.0';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const backupFilename = `v${version}_${timestamp}.md`;
    const backupPath = path.join(backupDir, backupFilename);
    
    // Write backup
    fs.writeFileSync(backupPath, content, 'utf8');
    
    return backupPath;
  } catch (error) {
    console.error(`Error backing up ${filePath}:`, error.message);
    return null;
  }
}

/**
 * List all backups for a document
 * 
 * @param {string} filePath - Path to document
 * @returns {Array} List of backup files
 */
function listBackups(filePath) {
  try {
    const filename = path.basename(filePath);
    const filenameWithoutExt = filename.replace(/\.md$/, '');
    const backupDir = path.join(BACKUPS_DIR, filenameWithoutExt);
    
    if (!fs.existsSync(backupDir)) {
      return [];
    }
    
    const files = fs.readdirSync(backupDir);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        filename: f,
        path: path.join(backupDir, f),
        version: f.match(/v([\d.]+)_/)?.[1] || 'unknown',
        timestamp: f.match(/_(.+)\.md$/)?.[1] || 'unknown'
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    console.error(`Error listing backups for ${filePath}:`, error.message);
    return [];
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

function printHelp() {
  console.log(`
Document Manager Tool v2.0 - Claude Code GPT-Pilot

Usage: node doc-manager.js <command> [arguments]

Commands:
  parse <file>              Parse and display document metadata
  add-metadata <file>       Add metadata to document if missing
  update-metadata <file> <key> <value>  Update metadata field
  detect-changes <file>     Detect manual changes in document
  backup <file>             Create backup of document
  list-backups <file>       List all backups for document
  help                      Show this help message

Examples:
  node doc-manager.js parse docs/product_requirements.md
  node doc-manager.js add-metadata docs/architecture.md
  node doc-manager.js detect-changes docs/tasks.md
  node doc-manager.js backup docs/product_requirements.md
  node doc-manager.js list-backups docs/architecture.md
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
      case 'parse': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = parseDocument(content);
        
        if (parsed.metadata) {
          console.log(JSON.stringify(parsed.metadata, null, 2));
        } else {
          console.log('No metadata found');
        }
        break;
      }
      
      case 'add-metadata': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }
        
        addMetadataIfMissing(filePath);
        break;
      }
      
      case 'update-metadata': {
        const filePath = args[1];
        const key = args[2];
        const value = args[3];
        
        if (!filePath || !key || !value) {
          console.error('Error: file path, key, and value required');
          process.exit(1);
        }
        
        const metadata = { [key]: value };
        const success = updateDocumentMetadata(filePath, metadata);
        
        if (success) {
          console.log(`✅ Updated ${key} in ${path.basename(filePath)}`);
        } else {
          console.error(`❌ Failed to update ${path.basename(filePath)}`);
          process.exit(1);
        }
        break;
      }
      
      case 'detect-changes': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }
        
        const result = detectChanges(filePath);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      
      case 'backup': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }
        
        const backupPath = backupDocument(filePath);
        if (backupPath) {
          console.log(`✅ Backup created: ${backupPath}`);
        } else {
          console.error(`❌ Failed to create backup`);
          process.exit(1);
        }
        break;
      }
      
      case 'list-backups': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }
        
        const backups = listBackups(filePath);
        if (backups.length === 0) {
          console.log('No backups found');
        } else {
          console.log(`Found ${backups.length} backup(s):\n`);
          backups.forEach(b => {
            console.log(`  ${b.filename}`);
            console.log(`    Version: ${b.version}`);
            console.log(`    Path: ${b.path}\n`);
          });
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
  // Parsing
  parseDocument,
  serializeMetadata,
  createDefaultMetadata,
  
  // Metadata management
  updateDocumentMetadata,
  addMetadataIfMissing,
  
  // Change detection
  detectChanges,
  
  // Backup management
  backupDocument,
  listBackups,
  
  // Utilities
  calculateChecksum,
  incrementVersion,
  getCurrentTimestamp,
  formatTimestamp
};

// Run CLI if executed directly
if (require.main === module) {
  cli();
}

