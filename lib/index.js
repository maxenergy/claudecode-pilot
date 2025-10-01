/**
 * Claude Code GPT-Pilot Library
 * 
 * Main library entry point
 */

module.exports = {
  // Export core modules
  init: require('./commands/init'),
  templates: require('./templates'),
  utils: require('./utils')
};

