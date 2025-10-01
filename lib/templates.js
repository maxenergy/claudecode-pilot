/**
 * Templates Module
 *
 * Handles template file operations
 */

const fs = require('fs');
const path = require('path');
const { ensureDirectory, fileExists } = require('./utils');

/**
 * Get template file path
 * @param {string} templateName - Name of the template
 * @returns {string} Full path to template file
 */
function getTemplatePath(templateName) {
  // Templates are in the examples/ directory of the package
  const templatesDir = path.join(__dirname, '..', 'examples');
  return path.join(templatesDir, templateName);
}

/**
 * Replace variables in content
 * @param {string} content - Template content
 * @param {Object} variables - Variables to replace
 * @returns {string} Content with variables replaced
 */
function replaceVariables(content, variables = {}) {
  let result = content;

  // Replace each variable
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Copy template to target directory
 * @param {string} templateName - Name of the template
 * @param {string} targetPath - Target file path
 * @param {Object} variables - Variables to replace in template
 */
function copyTemplate(templateName, targetPath, variables = {}) {
  const templatePath = getTemplatePath(templateName);

  // Check if template exists
  if (!fileExists(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }

  // Read template content
  let content = fs.readFileSync(templatePath, 'utf8');

  // Replace variables
  content = replaceVariables(content, variables);

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  ensureDirectory(targetDir);

  // Write to target
  fs.writeFileSync(targetPath, content);
}

/**
 * Copy all templates to target directory
 * @param {string} targetDir - Target directory
 * @param {Object} variables - Variables to replace in templates
 */
function copyAllTemplates(targetDir, variables = {}) {
  const templatesTargetDir = path.join(targetDir, '.claude-pilot', 'templates');

  // List of template files to copy
  const templates = [
    { source: 'product-owner.md.template', target: 'product-owner.md' },
    { source: 'architect.md.template', target: 'architect.md' },
    { source: 'tech-lead.md.template', target: 'tech-lead.md' },
    { source: 'developer.md.template', target: 'developer.md' },
    { source: 'tester.md.template', target: 'tester.md' },
    { source: 'reviewer.md.template', target: 'reviewer.md' },
    { source: 'debugger.md.template', target: 'debugger.md' }
  ];

  // Copy each template
  for (const template of templates) {
    const sourcePath = getTemplatePath(template.source);
    const targetPath = path.join(templatesTargetDir, template.target);

    // Only copy if source exists
    if (fileExists(sourcePath)) {
      copyTemplate(template.source, targetPath, variables);
    } else {
      // Create placeholder if template doesn't exist yet
      createPlaceholderTemplate(targetPath, template.target, variables);
    }
  }

  // Copy CLAUDE.md template to project root
  const claudeMdSource = getTemplatePath('CLAUDE.md.template');
  const claudeMdTarget = path.join(targetDir, 'CLAUDE.md');

  if (fileExists(claudeMdSource)) {
    copyTemplate('CLAUDE.md.template', claudeMdTarget, variables);
  }
}

/**
 * Create placeholder template
 * @param {string} targetPath - Target file path
 * @param {string} templateName - Template name
 * @param {Object} variables - Variables
 */
function createPlaceholderTemplate(targetPath, templateName, variables = {}) {
  const agentName = templateName.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const placeholder = `# ${agentName} Agent

> This is a placeholder template. Full implementation coming soon.

## Role

${agentName} Agent for {{PROJECT_NAME}}

## Responsibilities

- Define responsibilities here

## Workflow

1. Step 1
2. Step 2
3. Step 3

## Output

- Expected output

---

*Generated on {{DATE}}*
`;

  const content = replaceVariables(placeholder, variables);
  ensureDirectory(path.dirname(targetPath));
  fs.writeFileSync(targetPath, content);
}

/**
 * Get default variables
 * @param {string} projectName - Project name
 * @returns {Object} Default variables
 */
function getDefaultVariables(projectName) {
  return {
    PROJECT_NAME: projectName,
    DATE: new Date().toISOString().split('T')[0],
    YEAR: new Date().getFullYear().toString(),
    AUTHOR: 'Claude Code GPT-Pilot'
  };
}

module.exports = {
  getTemplatePath,
  replaceVariables,
  copyTemplate,
  copyAllTemplates,
  getDefaultVariables
};

