#!/usr/bin/env node

/**
 * Claude Code GPT-Pilot CLI
 * 
 * Main entry point for the claudecode-gpt command line tool.
 */

const { program } = require('commander');
const packageJson = require('../package.json');

// Import commands
const initCommand = require('../lib/commands/init');

// Configure CLI
program
  .name('claudecode-gpt')
  .description('Claude Code GPT-Pilot - AI-powered software development lifecycle management')
  .version(packageJson.version);

// Init command
program
  .command('init')
  .description('Initialize a new Claude Code GPT-Pilot project')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --dir <directory>', 'Target directory (default: current directory)')
  .action(initCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

