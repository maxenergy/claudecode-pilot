#!/usr/bin/env node

/**
 * Document Merger Tool for Claude Code GPT-Pilot v2.0
 *
 * Intelligent document merging with manual change preservation
 *
 * Features:
 * - Document section identification
 * - Manual change extraction
 * - Smart merging algorithm
 * - Conflict detection and marking
 * - Three-way merge support
 *
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');
const { parseDocument, serializeMetadata } = require('./doc-manager.js');

// ============================================================================
// Configuration
// ============================================================================

const MANUAL_SECTION_START = /<!--\s*MANUAL_SECTION_START:\s*(.+?)\s*-->/;
const MANUAL_SECTION_END = /<!--\s*MANUAL_SECTION_END\s*-->/;
const CONFLICT_MARKER_START = '<<<<<<< CURRENT (Your Changes)';
const CONFLICT_MARKER_SEPARATOR = '=======';
const CONFLICT_MARKER_END = '>>>>>>> GENERATED (New Version)';

// ============================================================================
// Section Identification
// ============================================================================

/**
 * Identify sections in a document
 *
 * @param {string} content - Document content (without frontmatter)
 * @returns {Array} Array of sections
 */
function identifySections(content) {
  const sections = [];
  const lines = content.split('\n');

  let currentSection = null;
  let currentLevel = 0;
  let lineNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect markdown headers
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);

    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2];

      // Save previous section
      if (currentSection) {
        currentSection.endLine = lineNumber - 1;
        currentSection.content = lines.slice(currentSection.startLine - 1, currentSection.endLine).join('\n');
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        level,
        title,
        startLine: lineNumber,
        endLine: null,
        content: null,
        isManual: false,
        manualDescription: null
      };
      currentLevel = level;
    }

    lineNumber++;
  }

  // Save last section
  if (currentSection) {
    currentSection.endLine = lineNumber - 1;
    currentSection.content = lines.slice(currentSection.startLine - 1, currentSection.endLine).join('\n');
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Extract manual sections from document
 *
 * @param {string} content - Document content
 * @param {Object} metadata - Document metadata
 * @returns {Array} Array of manual sections
 */
function extractManualSections(content, metadata) {
  const manualSections = [];
  const lines = content.split('\n');

  // Method 1: From metadata
  if (metadata && metadata.manual_sections) {
    const metaSections = Array.isArray(metadata.manual_sections)
      ? metadata.manual_sections
      : [];

    for (const section of metaSections) {
      if (section.lines && Array.isArray(section.lines) && section.lines.length === 2) {
        const [start, end] = section.lines;
        const sectionContent = lines.slice(start - 1, end).join('\n');

        manualSections.push({
          startLine: start,
          endLine: end,
          description: section.description || 'Manual modification',
          content: sectionContent,
          source: 'metadata'
        });
      }
    }
  }

  // Method 2: From HTML comments
  let inManualSection = false;
  let manualStart = null;
  let manualDescription = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const startMatch = line.match(MANUAL_SECTION_START);
    if (startMatch) {
      inManualSection = true;
      manualStart = i + 1;
      manualDescription = startMatch[1];
      continue;
    }

    const endMatch = line.match(MANUAL_SECTION_END);
    if (endMatch && inManualSection) {
      const manualEnd = i + 1;
      const sectionContent = lines.slice(manualStart - 1, manualEnd).join('\n');

      manualSections.push({
        startLine: manualStart,
        endLine: manualEnd,
        description: manualDescription,
        content: sectionContent,
        source: 'comment'
      });

      inManualSection = false;
      manualStart = null;
      manualDescription = null;
    }
  }

  return manualSections;
}

// ============================================================================
// Smart Merging
// ============================================================================

/**
 * Merge two documents intelligently
 *
 * @param {string} oldContent - Old document content
 * @param {string} newContent - New document content
 * @param {Object} options - Merge options
 * @returns {Object} Merge result
 */
function mergeDocuments(oldContent, newContent, options = {}) {
  const {
    preserveManual = true,
    conflictStrategy = 'mark', // 'mark', 'ours', 'theirs'
    manualSections = []
  } = options;

  // Parse both documents
  const oldParsed = parseDocument(oldContent);
  const newParsed = parseDocument(newContent);

  // Extract manual sections from old document
  const manualSectionsToPreserve = preserveManual
    ? extractManualSections(oldParsed.content, oldParsed.metadata)
    : [];

  // Add explicitly provided manual sections
  if (manualSections.length > 0) {
    manualSectionsToPreserve.push(...manualSections);
  }

  // If no manual sections, just return new content
  if (manualSectionsToPreserve.length === 0) {
    return {
      content: newContent,
      hasConflicts: false,
      conflicts: [],
      preservedSections: [],
      mergeStrategy: 'simple'
    };
  }

  // Perform smart merge
  const mergeResult = performSmartMerge(
    oldParsed.content,
    newParsed.content,
    manualSectionsToPreserve,
    conflictStrategy
  );

  // Reconstruct document with metadata
  const mergedMetadata = {
    ...newParsed.metadata,
    manual_sections: manualSectionsToPreserve.map(s => ({
      lines: [s.startLine, s.endLine],
      description: s.description,
      preserved_from: oldParsed.metadata?.version || 'unknown'
    }))
  };

  const finalContent = serializeMetadata(mergedMetadata) + '\n' + mergeResult.content;

  return {
    content: finalContent,
    hasConflicts: mergeResult.hasConflicts,
    conflicts: mergeResult.conflicts,
    preservedSections: manualSectionsToPreserve,
    mergeStrategy: 'smart'
  };
}

/**
 * Perform smart merge of document contents
 *
 * @param {string} oldContent - Old content
 * @param {string} newContent - New content
 * @param {Array} manualSections - Manual sections to preserve
 * @param {string} conflictStrategy - Conflict resolution strategy
 * @returns {Object} Merge result
 */
function performSmartMerge(oldContent, newContent, manualSections, conflictStrategy) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const mergedLines = [...newLines]; // Start with new content

  const conflicts = [];
  const preservedRanges = [];

  // Sort manual sections by start line (descending) to avoid line number shifts
  const sortedSections = [...manualSections].sort((a, b) => b.startLine - a.startLine);

  for (const section of sortedSections) {
    const { startLine, endLine, description, content } = section;

    // Extract manual content from old document
    const manualContent = oldLines.slice(startLine - 1, endLine);

    // Check if this range exists in new document
    const newRangeExists = endLine <= newLines.length;

    if (!newRangeExists) {
      // Manual section is beyond new document length
      // Append at the end
      mergedLines.push('');
      mergedLines.push(`<!-- MANUAL_SECTION_START: ${description} -->`);
      mergedLines.push(...manualContent);
      mergedLines.push('<!-- MANUAL_SECTION_END -->');

      preservedRanges.push({
        startLine: mergedLines.length - manualContent.length - 1,
        endLine: mergedLines.length - 1,
        description,
        action: 'appended'
      });
      continue;
    }

    // Extract corresponding range from new document
    const newRangeContent = newLines.slice(startLine - 1, endLine);

    // Check if content is different
    const isDifferent = manualContent.join('\n') !== newRangeContent.join('\n');

    if (isDifferent) {
      // Conflict detected
      if (conflictStrategy === 'mark') {
        // Mark conflict
        const conflictLines = [
          CONFLICT_MARKER_START,
          ...manualContent,
          CONFLICT_MARKER_SEPARATOR,
          ...newRangeContent,
          CONFLICT_MARKER_END
        ];

        mergedLines.splice(startLine - 1, endLine - startLine + 1, ...conflictLines);

        conflicts.push({
          startLine,
          endLine,
          description,
          oldContent: manualContent.join('\n'),
          newContent: newRangeContent.join('\n')
        });
      } else if (conflictStrategy === 'ours') {
        // Keep manual changes
        mergedLines.splice(startLine - 1, endLine - startLine + 1, ...manualContent);

        preservedRanges.push({
          startLine,
          endLine,
          description,
          action: 'preserved'
        });
      } else if (conflictStrategy === 'theirs') {
        // Keep new content (do nothing)
      }
    } else {
      // No conflict, content is the same
      preservedRanges.push({
        startLine,
        endLine,
        description,
        action: 'unchanged'
      });
    }
  }

  return {
    content: mergedLines.join('\n'),
    hasConflicts: conflicts.length > 0,
    conflicts,
    preservedRanges
  };
}

// ============================================================================
// Conflict Detection
// ============================================================================

/**
 * Detect conflicts in merged document
 *
 * @param {string} content - Merged document content
 * @returns {Array} Array of conflicts
 */
function detectConflicts(content) {
  const conflicts = [];
  const lines = content.split('\n');

  let inConflict = false;
  let conflictStart = null;
  let currentSection = null;
  let separatorLine = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === CONFLICT_MARKER_START) {
      inConflict = true;
      conflictStart = i + 1;
      currentSection = [];
      continue;
    }

    if (line === CONFLICT_MARKER_SEPARATOR && inConflict) {
      separatorLine = i + 1;
      continue;
    }

    if (line === CONFLICT_MARKER_END && inConflict) {
      const conflictEnd = i + 1;

      const ourContent = lines.slice(conflictStart, separatorLine - 1);
      const theirContent = lines.slice(separatorLine, conflictEnd - 1);

      conflicts.push({
        startLine: conflictStart,
        endLine: conflictEnd,
        ourContent: ourContent.join('\n'),
        theirContent: theirContent.join('\n')
      });

      inConflict = false;
      conflictStart = null;
      separatorLine = null;
    }
  }

  return conflicts;
}

/**
 * Check if document has conflicts
 *
 * @param {string} content - Document content
 * @returns {boolean} True if has conflicts
 */
function hasConflicts(content) {
  return content.includes(CONFLICT_MARKER_START);
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // Section identification
  identifySections,
  extractManualSections,

  // Merging
  mergeDocuments,
  performSmartMerge,

  // Conflict detection
  detectConflicts,
  hasConflicts,

  // Constants
  MANUAL_SECTION_START,
  MANUAL_SECTION_END,
  CONFLICT_MARKER_START,
  CONFLICT_MARKER_SEPARATOR,
  CONFLICT_MARKER_END
};

// ============================================================================
// CLI Interface
// ============================================================================

function printHelp() {
  console.log(`
Document Merger Tool v2.0 - Claude Code GPT-Pilot

Usage: node doc-merger.js <command> [arguments]

Commands:
  merge <old> <new> [options]     Merge two documents
  extract-manual <file>           Extract manual sections from document
  detect-conflicts <file>         Detect conflicts in merged document
  identify-sections <file>        Identify sections in document
  help                            Show this help message

Merge Options:
  --preserve-manual               Preserve manual sections (default: true)
  --conflict-strategy <strategy>  Conflict resolution strategy (mark|ours|theirs)
  --manual-sections <ranges>      Manual section ranges (e.g., "45-60,120-135")
  --output <file>                 Output file path
  --dry-run                       Preview merge without writing

Examples:
  # Merge with conflict marking
  node doc-merger.js merge old.md new.md --output merged.md

  # Merge preserving manual sections
  node doc-merger.js merge old.md new.md --preserve-manual --output merged.md

  # Merge with specific manual sections
  node doc-merger.js merge old.md new.md --manual-sections "45-60,120-135"

  # Extract manual sections
  node doc-merger.js extract-manual docs/architecture.md

  # Detect conflicts
  node doc-merger.js detect-conflicts merged.md
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
      case 'merge': {
        const oldFile = args[1];
        const newFile = args[2];

        if (!oldFile || !newFile) {
          console.error('Error: old and new file paths required');
          process.exit(1);
        }

        // Parse options
        const options = {
          preserveManual: true,
          conflictStrategy: 'mark',
          manualSections: [],
          output: null,
          dryRun: false
        };

        for (let i = 3; i < args.length; i++) {
          if (args[i] === '--preserve-manual') {
            options.preserveManual = args[i + 1] !== 'false';
          } else if (args[i] === '--conflict-strategy') {
            options.conflictStrategy = args[i + 1];
            i++;
          } else if (args[i] === '--manual-sections') {
            const ranges = args[i + 1].split(',');
            for (const range of ranges) {
              const [start, end] = range.split('-').map(Number);
              options.manualSections.push({
                startLine: start,
                endLine: end,
                description: `Manual section ${start}-${end}`
              });
            }
            i++;
          } else if (args[i] === '--output') {
            options.output = args[i + 1];
            i++;
          } else if (args[i] === '--dry-run') {
            options.dryRun = true;
          }
        }

        // Read files
        const oldContent = fs.readFileSync(oldFile, 'utf8');
        const newContent = fs.readFileSync(newFile, 'utf8');

        // Merge
        const result = mergeDocuments(oldContent, newContent, options);

        // Output results
        console.log('📊 Merge Results:\n');
        console.log(`Strategy: ${result.mergeStrategy}`);
        console.log(`Conflicts: ${result.hasConflicts ? result.conflicts.length : 0}`);
        console.log(`Preserved sections: ${result.preservedSections.length}`);

        if (result.hasConflicts) {
          console.log('\n⚠️  Conflicts detected:');
          result.conflicts.forEach((c, i) => {
            console.log(`  ${i + 1}. Lines ${c.startLine}-${c.endLine}: ${c.description || 'Conflict'}`);
          });
        }

        if (result.preservedSections.length > 0) {
          console.log('\n✅ Preserved manual sections:');
          result.preservedSections.forEach((s, i) => {
            console.log(`  ${i + 1}. Lines ${s.startLine}-${s.endLine}: ${s.description}`);
          });
        }

        // Write output
        if (options.output && !options.dryRun) {
          fs.writeFileSync(options.output, result.content, 'utf8');
          console.log(`\n✅ Merged document written to: ${options.output}`);
        } else if (options.dryRun) {
          console.log('\n🔍 Dry run - no files written');
          console.log('\nMerged content preview (first 20 lines):');
          console.log(result.content.split('\n').slice(0, 20).join('\n'));
        } else {
          console.log('\n📄 Merged content:');
          console.log(result.content);
        }

        break;
      }

      case 'extract-manual': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = parseDocument(content);
        const manualSections = extractManualSections(parsed.content, parsed.metadata);

        console.log(`Found ${manualSections.length} manual section(s):\n`);
        manualSections.forEach((s, i) => {
          console.log(`${i + 1}. Lines ${s.startLine}-${s.endLine}`);
          console.log(`   Description: ${s.description}`);
          console.log(`   Source: ${s.source}`);
          console.log(`   Content preview: ${s.content.substring(0, 100)}...`);
          console.log('');
        });

        break;
      }

      case 'detect-conflicts': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const conflicts = detectConflicts(content);

        if (conflicts.length === 0) {
          console.log('✅ No conflicts detected');
        } else {
          console.log(`⚠️  Found ${conflicts.length} conflict(s):\n`);
          conflicts.forEach((c, i) => {
            console.log(`${i + 1}. Lines ${c.startLine}-${c.endLine}`);
            console.log(`   Our content: ${c.ourContent.substring(0, 50)}...`);
            console.log(`   Their content: ${c.theirContent.substring(0, 50)}...`);
            console.log('');
          });
        }

        break;
      }

      case 'identify-sections': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = parseDocument(content);
        const sections = identifySections(parsed.content);

        console.log(`Found ${sections.length} section(s):\n`);
        sections.forEach((s, i) => {
          console.log(`${i + 1}. ${'#'.repeat(s.level)} ${s.title}`);
          console.log(`   Lines: ${s.startLine}-${s.endLine}`);
          console.log(`   Manual: ${s.isManual ? 'Yes' : 'No'}`);
          console.log('');
        });

        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run CLI if executed directly
if (require.main === module) {
  cli();
}

