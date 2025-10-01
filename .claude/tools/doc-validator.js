#!/usr/bin/env node

/**
 * Document Validator Tool for Claude Code GPT-Pilot v2.0
 *
 * Validates document metadata, dependencies, and consistency
 *
 * Features:
 * - Metadata validation
 * - Dependency checking
 * - Version consistency
 * - Conflict detection
 * - Completeness checking
 *
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');
const { parseDocument } = require('./doc-manager.js');
const { hasConflicts } = require('./doc-merger.js');

// ============================================================================
// Configuration
// ============================================================================

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
// Helper Functions
// ============================================================================

function isValidISO8601(dateString) {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return iso8601Regex.test(dateString);
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate document metadata
 *
 * @param {string} filePath - Path to document
 * @returns {Object} Validation result
 */
function validateMetadata(filePath) {
  const errors = [];
  const warnings = [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseDocument(content);

    if (!parsed.hasFrontmatter) {
      errors.push('Missing frontmatter metadata');
      return { valid: false, errors, warnings };
    }

    const metadata = parsed.metadata;

    // Check required fields
    const requiredFields = [
      'version',
      'generated_by',
      'generated_at',
      'last_modified',
      'modified_by',
      'checksum'
    ];

    for (const field of requiredFields) {
      if (!metadata[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate version format
    if (metadata.version && !/^\d+\.\d+(\.\d+)?$/.test(metadata.version)) {
      errors.push(`Invalid version format: ${metadata.version}`);
    }

    // Validate timestamps
    if (metadata.generated_at && !isValidISO8601(metadata.generated_at)) {
      errors.push(`Invalid generated_at timestamp: ${metadata.generated_at}`);
    }

    if (metadata.last_modified && !isValidISO8601(metadata.last_modified)) {
      errors.push(`Invalid last_modified timestamp: ${metadata.last_modified}`);
    }

    // Validate generated_by
    const validGenerators = ['product-owner', 'architect', 'tech-lead', 'developer', 'tester', 'reviewer', 'debugger', 'human'];
    if (metadata.generated_by && !validGenerators.includes(metadata.generated_by)) {
      warnings.push(`Unusual generated_by value: ${metadata.generated_by}`);
    }

    // Validate modified_by
    const validModifiers = [...validGenerators, 'agent'];
    if (metadata.modified_by && !validModifiers.includes(metadata.modified_by)) {
      warnings.push(`Unusual modified_by value: ${metadata.modified_by}`);
    }

    // Check manual_sections format
    if (metadata.manual_sections) {
      const sections = Array.isArray(metadata.manual_sections)
        ? metadata.manual_sections
        : [];

      for (const section of sections) {
        if (!section.lines || !Array.isArray(section.lines) || section.lines.length !== 2) {
          errors.push('Invalid manual_sections format: lines must be [start, end]');
        }
        if (!section.description) {
          warnings.push('Manual section missing description');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata
    };

  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to parse document: ${error.message}`],
      warnings: []
    };
  }
}

/**
 * Validate document dependencies
 *
 * @param {string} filePath - Path to document
 * @param {string} docsDir - Documents directory
 * @returns {Object} Validation result
 */
function validateDependencies(filePath, docsDir = 'docs') {
  const errors = [];
  const warnings = [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseDocument(content);

    if (!parsed.hasFrontmatter) {
      return { valid: true, errors, warnings }; // Skip if no metadata
    }

    const metadata = parsed.metadata;
    const fileName = path.basename(filePath);

    // Check if dependencies exist
    if (metadata.dependencies && Array.isArray(metadata.dependencies)) {
      for (const dep of metadata.dependencies) {
        const depPath = path.join(docsDir, dep);
        if (!fs.existsSync(depPath)) {
          errors.push(`Dependency not found: ${dep}`);
        }
      }
    }

    // Check if triggers exist
    if (metadata.triggers_regeneration && Array.isArray(metadata.triggers_regeneration)) {
      for (const trigger of metadata.triggers_regeneration) {
        const triggerPath = path.join(docsDir, trigger);
        if (!fs.existsSync(triggerPath)) {
          warnings.push(`Trigger document not found: ${trigger}`);
        }
      }
    }

    // Check expected dependencies for known document types
    if (DOCUMENT_TYPES[fileName]) {
      const expected = DOCUMENT_TYPES[fileName];

      // Check dependencies
      const actualDeps = metadata.dependencies || [];
      const expectedDeps = expected.dependencies || [];

      for (const dep of expectedDeps) {
        if (!actualDeps.includes(dep)) {
          warnings.push(`Missing expected dependency: ${dep}`);
        }
      }

      // Check triggers
      const actualTriggers = metadata.triggers_regeneration || [];
      const expectedTriggers = expected.triggers_regeneration || [];

      for (const trigger of expectedTriggers) {
        if (!actualTriggers.includes(trigger)) {
          warnings.push(`Missing expected trigger: ${trigger}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to validate dependencies: ${error.message}`],
      warnings: []
    };
  }
}

/**
 * Check for circular dependencies
 *
 * @param {string} docsDir - Documents directory
 * @returns {Object} Validation result
 */
function checkCircularDependencies(docsDir = 'docs') {
  const errors = [];
  const warnings = [];

  try {
    const docs = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
    const graph = {};

    // Build dependency graph
    for (const doc of docs) {
      const filePath = path.join(docsDir, doc);
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = parseDocument(content);

      if (parsed.hasFrontmatter && parsed.metadata.dependencies) {
        graph[doc] = parsed.metadata.dependencies;
      } else {
        graph[doc] = [];
      }
    }

    // Check for cycles
    for (const doc of docs) {
      const visited = new Set();
      const stack = [doc];

      while (stack.length > 0) {
        const current = stack.pop();

        if (visited.has(current)) {
          errors.push(`Circular dependency detected involving: ${doc}`);
          break;
        }

        visited.add(current);

        if (graph[current]) {
          for (const dep of graph[current]) {
            if (dep === doc) {
              errors.push(`Circular dependency: ${doc} → ${current} → ${doc}`);
              break;
            }
            stack.push(dep);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to check circular dependencies: ${error.message}`],
      warnings: []
    };
  }
}

/**
 * Validate all documents in directory
 *
 * @param {string} docsDir - Documents directory
 * @returns {Object} Validation result
 */


// ============================================================================
// CLI Interface
// ============================================================================

function printHelp() {
  console.log(`
Document Validator Tool v2.0 - Claude Code GPT-Pilot

Usage: node doc-validator.js <command> [arguments]

Commands:
  validate-metadata <file>        Validate document metadata
  validate-dependencies <file>    Validate document dependencies
  check-circular [dir]            Check for circular dependencies
  validate-all [dir]              Validate all documents
  help                            Show this help message

Examples:
  # Validate metadata
  node doc-validator.js validate-metadata docs/architecture.md

  # Validate dependencies
  node doc-validator.js validate-dependencies docs/tasks.md

  # Check circular dependencies
  node doc-validator.js check-circular docs

  # Validate all documents
  node doc-validator.js validate-all docs
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
      case 'validate-metadata': {
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }

        const result = validateMetadata(filePath);

        console.log(`\n📋 Metadata Validation: ${path.basename(filePath)}\n`);

        if (result.valid) {
          console.log('✅ Metadata is valid\n');
        } else {
          console.log('❌ Metadata validation failed\n');
        }

        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach(err => console.log(`  ❌ ${err}`));
          console.log('');
        }

        if (result.warnings.length > 0) {
          console.log('Warnings:');
          result.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
          console.log('');
        }

        if (result.metadata) {
          console.log('Metadata:');
          console.log(JSON.stringify(result.metadata, null, 2));
        }

        process.exit(result.valid ? 0 : 1);
      }

      case 'validate-dependencies': {
        const filePath = args[1];
        const docsDir = args[2] || 'docs';

        if (!filePath) {
          console.error('Error: file path required');
          process.exit(1);
        }

        const result = validateDependencies(filePath, docsDir);

        console.log(`\n🔗 Dependency Validation: ${path.basename(filePath)}\n`);

        if (result.valid) {
          console.log('✅ Dependencies are valid\n');
        } else {
          console.log('❌ Dependency validation failed\n');
        }

        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach(err => console.log(`  ❌ ${err}`));
          console.log('');
        }

        if (result.warnings.length > 0) {
          console.log('Warnings:');
          result.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
          console.log('');
        }

        process.exit(result.valid ? 0 : 1);
      }

      case 'check-circular': {
        const docsDir = args[1] || 'docs';

        const result = checkCircularDependencies(docsDir);

        console.log('\n🔄 Circular Dependency Check\n');

        if (result.valid) {
          console.log('✅ No circular dependencies detected\n');
        } else {
          console.log('❌ Circular dependencies found\n');
        }

        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach(err => console.log(`  ❌ ${err}`));
          console.log('');
        }

        process.exit(result.valid ? 0 : 1);
      }

      case 'validate-all': {
        const docsDir = args[1] || 'docs';

        const result = validateAll(docsDir);

        console.log('\n📊 Complete Validation Report\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Summary
        console.log('Summary:');
        console.log(`  Total documents: ${result.summary.total}`);
        console.log(`  Valid: ${result.summary.valid}`);
        console.log(`  Errors: ${result.summary.errors}`);
        console.log(`  Warnings: ${result.summary.warnings}`);
        console.log('');

        // Document details
        for (const [doc, docResult] of Object.entries(result.documents)) {
          const status = docResult.valid ? '✅' : '❌';
          console.log(`${status} ${doc}`);

          if (docResult.metadata.errors.length > 0) {
            console.log('  Metadata errors:');
            docResult.metadata.errors.forEach(err => console.log(`    ❌ ${err}`));
          }

          if (docResult.metadata.warnings.length > 0) {
            console.log('  Metadata warnings:');
            docResult.metadata.warnings.forEach(warn => console.log(`    ⚠️  ${warn}`));
          }

          if (docResult.dependencies.errors.length > 0) {
            console.log('  Dependency errors:');
            docResult.dependencies.errors.forEach(err => console.log(`    ❌ ${err}`));
          }

          if (docResult.dependencies.warnings.length > 0) {
            console.log('  Dependency warnings:');
            docResult.dependencies.warnings.forEach(warn => console.log(`    ⚠️  ${warn}`));
          }

          if (docResult.hasConflicts) {
            console.log('  ❌ Document has unresolved conflicts');
          }

          console.log('');
        }

        // Circular dependencies
        if (result.circularDependencies && !result.circularDependencies.valid) {
          console.log('Circular Dependencies:');
          result.circularDependencies.errors.forEach(err => console.log(`  ❌ ${err}`));
          console.log('');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (result.valid) {
          console.log('✅ All documents are valid\n');
        } else {
          console.log('❌ Validation failed - please fix the errors above\n');
        }

        process.exit(result.valid ? 0 : 1);
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

