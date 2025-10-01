# Claude Code GPT-Pilot

> 🤖 AI-powered software development lifecycle management system deeply integrated with Claude Code

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/claudecode-pilot)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org)

---

## 📖 Overview

**Claude Code GPT-Pilot** is an intelligent software development system that leverages Claude Code's capabilities to manage the entire software development lifecycle. It provides a structured workflow with specialized AI agents, automated task management, and seamless integration with your development environment.

### ✨ Key Features

- 🎭 **7 Specialized AI Agents** - Product Owner, Architect, Tech Lead, Developer, Tester, Reviewer, Debugger
- 🔄 **Dual Development Modes** - Manual step-by-step or fully automated batch execution
- 📋 **Smart Task Management** - Automatic dependency checking and task orchestration
- 🧪 **TDD-First Approach** - Built-in Test-Driven Development workflow
- 📊 **Progress Tracking** - Real-time task status and completion tracking
- 🚀 **Quick Setup** - Initialize projects with a single command
- 📝 **Rich Documentation** - Comprehensive templates and examples

### 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  CLAUDE.md                            │  │
│  │  (Smart Convention System - Command Recognition)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │              7 Specialized Agents                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │ Product  │ │Architect │ │Tech Lead │ │Developer │ │  │
│  │  │  Owner   │ │          │ │          │ │          │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │  Tester  │ │ Reviewer │ │ Debugger │             │  │
│  │  └──────────┘ └──────────┘ └──────────┘             │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │              Task Management System                   │  │
│  │  - task.js (Dependency checking & orchestration)      │  │
│  │  - task_status.json (Task state tracking)            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Installation

```bash
# Install globally via npm
npm install -g claudecode-gpt

# Or clone and link locally
git clone https://github.com/yourusername/claudecode-pilot.git
cd claudecode-pilot
npm install
npm link
```

### Initialize a New Project

```bash
# Create a new project
mkdir my-awesome-project
cd my-awesome-project

# Initialize Claude Code GPT-Pilot
claudecode-gpt init --name "My Awesome Project"
```

This will create:
```
my-awesome-project/
├── .claude-pilot/          # GPT-Pilot system files
│   ├── agents/             # Agent configurations
│   ├── templates/          # 7 Agent templates
│   ├── tools/              # Task management tools
│   └── context_memory.json # Context storage
├── docs/                   # Documentation
├── src/                    # Source code
├── tests/                  # Test files
├── CLAUDE.md               # Command definitions
└── README.md               # Project README
```

### Your First Task

1. **Open the project in Claude Code**

2. **Start with Product Owner** to define requirements:
   ```
   /product-owner
   ```

3. **Design the architecture**:
   ```
   /architect
   ```

4. **Break down into tasks**:
   ```
   /tech-lead
   ```

5. **Start development** (manual mode):
   ```
   /developer T001
   ```

6. **Or use automated mode**:
   ```
   /developer-auto
   ```

---

## 🎭 The 7 Agents

### 1. 📋 Product Owner
**Role**: Requirements gathering and product definition
**Command**: `/product-owner`
**Output**: `product_requirements.md`

Helps you define clear requirements, user stories, and acceptance criteria.

### 2. 🏛️ Architect
**Role**: System architecture and technology selection
**Command**: `/architect`
**Output**: `architecture.md`, project initialization scripts

Designs the system architecture and selects the optimal technology stack.

### 3. 📊 Tech Lead
**Role**: Task breakdown and planning
**Command**: `/tech-lead`
**Output**: `tasks.md`, `task_status.json`

Breaks down the project into manageable tasks with clear dependencies.

### 4. 💻 Developer
**Role**: Feature implementation using TDD
**Commands**:
- `/developer [taskId]` - Manual mode (step-by-step)
- `/developer-auto [taskId]` - Automated mode (batch execution)

Implements features following a strict TDD 5-phase workflow.

### 5. 🧪 Tester
**Role**: Test strategy and test case design
**Command**: `/tester [taskId]`
**Output**: Test files, test reports

Creates comprehensive test suites and ensures quality.

### 6. 👁️ Reviewer
**Role**: Code review and quality assurance
**Command**: `/reviewer [taskId]`
**Output**: Review reports, improvement suggestions

Performs thorough code reviews and ensures best practices.

### 7. 🐛 Debugger
**Role**: Problem diagnosis and debugging
**Command**: `/debugger "error description"`
**Output**: Debug reports, fix suggestions

Systematically diagnoses and fixes issues.

---

## 💻 Command Reference

### CLI Commands

```bash
# Initialize a new project
claudecode-gpt init --name "Project Name" [--dir ./path]

# Show version
claudecode-gpt --version

# Show help
claudecode-gpt --help
```

### task.js Commands

```bash
# Show next executable task
node .claude-pilot/tools/task.js next

# List all tasks
node .claude-pilot/tools/task.js list [status]

# Check task dependencies
node .claude-pilot/tools/task.js check <taskId>

# Update task status
node .claude-pilot/tools/task.js update <taskId> <status>

# Show all executable tasks
node .claude-pilot/tools/task.js executable

# Show help
node .claude-pilot/tools/task.js help
```

### Agent Slash Commands

```
/product-owner          - Define product requirements
/architect              - Design system architecture
/tech-lead              - Break down tasks
/developer <taskId>     - Implement task (manual mode)
/developer-auto [taskId] - Implement tasks (auto mode)
/tester <taskId>        - Write tests
/reviewer <taskId>      - Review code
/debugger "<error>"     - Debug issues
/next-task              - Show next task
/task-list              - Show all tasks
/status                 - Show project status
/help                   - Show help
```

---

## 📁 Project Structure

After initialization, your project will have:

```
your-project/
├── .claude-pilot/
│   ├── agents/
│   │   └── agents.json              # Agent configurations
│   ├── templates/
│   │   ├── product-owner.md         # Product Owner template
│   │   ├── architect.md             # Architect template
│   │   ├── tech-lead.md             # Tech Lead template
│   │   ├── developer.md             # Developer template (with task.js guide)
│   │   ├── tester.md                # Tester template
│   │   ├── reviewer.md              # Reviewer template
│   │   └── debugger.md              # Debugger template
│   ├── tools/
│   │   └── task.js                  # Task management tool (auto-copied)
│   ├── context_memory.json          # Context storage
│   └── README.md                    # System README
├── docs/
│   ├── product_requirements.md      # Generated by Product Owner
│   ├── architecture.md              # Generated by Architect
│   └── ...
├── src/                             # Your source code
├── tests/                           # Your tests
├── tasks.md                         # Generated by Tech Lead
├── task_status.json                 # Task tracking file
├── CLAUDE.md                        # Command definitions
└── README.md                        # Your project README
```

---

## 📚 Example Project

Check out the complete example project in `examples/sample-project/`:

- **Pomodoro Timer Application** - A full-featured example
- 10 tasks with complex dependencies
- Complete documentation (requirements, architecture, tasks)
- Ready to use with `/developer-auto`

```bash
cd examples/sample-project
node ../../.claude-pilot/tools/task.js list
```

---

## 🎓 Learn More

- [User Guide](docs/user-guide.md) - Detailed usage instructions
- [Test Report](docs/test-report-stage6.md) - System test results
- [Example Project](examples/sample-project/README.md) - Complete example

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
git clone https://github.com/yourusername/claudecode-pilot.git
cd claudecode-pilot
npm install
npm link
```

### Reporting Issues

Please use the [GitHub Issues](https://github.com/yourusername/claudecode-pilot/issues) page to report bugs or request features.

---

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for [Claude Code](https://claude.ai/code) by Anthropic
- Inspired by [GPT-Pilot](https://github.com/Pythagora-io/gpt-pilot)
- Uses Test-Driven Development (TDD) methodology

---

**Made with ❤️ for developers who love AI-assisted coding**