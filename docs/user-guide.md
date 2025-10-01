# Claude Code GPT-Pilot User Guide

> 📖 Complete guide to using Claude Code GPT-Pilot for AI-assisted software development

**Version**: 1.0.0  
**Last Updated**: 2025-10-01

---

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Complete Workflow](#complete-workflow)
4. [Agent Usage Guide](#agent-usage-guide)
5. [Best Practices](#best-practices)
6. [FAQ](#faq)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Usage](#advanced-usage)

---

## 🎯 Introduction

Claude Code GPT-Pilot is a comprehensive AI-powered development system that guides you through the entire software development lifecycle. It uses 7 specialized AI agents to handle different aspects of development, from requirements gathering to debugging.

### Who Should Use This?

- **Solo Developers** - Get the benefits of a full development team
- **Small Teams** - Standardize your development process
- **Learners** - Learn best practices through guided development
- **Rapid Prototypers** - Quickly build MVPs with AI assistance

### Key Concepts

- **Agents**: Specialized AI assistants for different development roles
- **Tasks**: Discrete units of work with clear acceptance criteria
- **TDD Workflow**: Test-Driven Development with 5 phases
- **Dual Modes**: Manual (step-by-step) or Automated (batch execution)

---

## 💻 Installation

### Prerequisites

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **Claude Code** (Anthropic's IDE)

### Global Installation

```bash
npm install -g claudecode-gpt
```

### Local Development Installation

```bash
git clone https://github.com/yourusername/claudecode-pilot.git
cd claudecode-pilot
npm install
npm link
```

### Verify Installation

```bash
claudecode-gpt --version
# Should output: 1.0.0
```

---

## 🔄 Complete Workflow

### Phase 1: Project Initialization

**Step 1**: Create and initialize your project

```bash
mkdir my-project
cd my-project
claudecode-gpt init --name "My Project"
```

**Step 2**: Open in Claude Code

```bash
code .  # Or open with your preferred method
```

**What happens**:
- `.claude-pilot/` directory created with all templates
- `CLAUDE.md` generated with command definitions
- Project structure scaffolded
- Ready to start development

---

### Phase 2: Requirements Definition

**Command**: `/product-owner`

**What the Product Owner does**:
1. Asks 5-7 clarifying questions about your project
2. Helps you define clear requirements
3. Creates user stories with acceptance criteria
4. Generates `product_requirements.md`

**Example Interaction**:
```
You: /product-owner

Agent: 🎯 Product Owner Agent Activated

Let me help you define your product requirements. I'll ask some questions:

1. What problem does this product solve?
2. Who are the target users?
3. What are the core features (top 3-5)?
4. What are the success criteria?
5. Are there any technical constraints?

[You answer the questions...]

Agent: Based on your answers, I'll create a comprehensive requirements document.

📄 Generated: product_requirements.md
```

**Output**: `product_requirements.md` containing:
- Project overview
- User stories
- Functional requirements
- Non-functional requirements
- Success metrics

---

### Phase 3: Architecture Design

**Command**: `/architect`

**What the Architect does**:
1. Analyzes your requirements
2. Proposes 3 technology stack options:
   - **Option A**: Quick Development (e.g., React + Vite)
   - **Option B**: Traditional Stable (e.g., Vue + Webpack)
   - **Option C**: High Performance (e.g., Next.js + Turbopack)
3. Designs system architecture
4. Creates project initialization scripts
5. Generates `architecture.md`

**Example Interaction**:
```
You: /architect

Agent: 🏛️ Architect Agent Activated

Based on your requirements, I propose 3 technology stacks:

**Option A: Quick Development** ⚡
- Frontend: React 18 + Vite
- State: Zustand
- Styling: Tailwind CSS
- Testing: Vitest + RTL

**Option B: Traditional Stable** 🏛️
- Frontend: Vue 3 + Webpack
- State: Pinia
- Styling: SCSS
- Testing: Jest + VTU

**Option C: High Performance** 🚀
- Frontend: Next.js 14 + Turbopack
- State: React Query + Zustand
- Styling: CSS Modules
- Testing: Playwright + Vitest

Which option do you prefer? (A/B/C)

You: A

Agent: Excellent choice! Creating architecture design...

📄 Generated: architecture.md
🔧 Generated: Project initialization scripts
```

**Output**:
- `architecture.md` - Complete architecture documentation
- Project configuration files
- Dependency installation scripts

---

### Phase 4: Task Breakdown

**Command**: `/tech-lead`

**What the Tech Lead does**:
1. Analyzes requirements and architecture
2. Breaks down project into tasks using SMART principles
3. Defines task dependencies
4. Estimates time for each task
5. Creates task priority levels
6. Generates `tasks.md` and `task_status.json`

**Example Interaction**:
```
You: /tech-lead

Agent: 📊 Tech Lead Agent Activated

Analyzing requirements and architecture...

I've broken down the project into 10 tasks:

**High Priority** (Must have):
- T001: Project setup (2h) - No dependencies
- T002: Core logic implementation (3h) - Depends on T001
- T003: UI components (2h) - Depends on T002

**Medium Priority** (Should have):
- T004: Feature A (2.5h) - Depends on T001
- T005: Feature B (2h) - Depends on T004
...

📄 Generated: tasks.md
📄 Generated: task_status.json

You can now start development with:
  /developer T001  (manual mode)
  /developer-auto  (automated mode)
```

**Output**:
- `tasks.md` - Detailed task breakdown
- `task_status.json` - Task tracking file

---

### Phase 5: Development

#### Option A: Manual Mode (Recommended for Learning)

**Command**: `/developer T001`

**TDD 5-Phase Workflow**:

**Phase 1: Planning** 📋
```
Agent: 📋 Phase 1: Planning

Task: T001 - Project setup
Time: 2 hours

I will:
1. Initialize Vite project
2. Install dependencies
3. Configure ESLint and Prettier
4. Set up directory structure

Files to create:
- vite.config.ts
- .eslintrc.json
- .prettierrc
- src/main.tsx
- src/App.tsx

Ready to proceed? (yes/no)
```

**Phase 2: Test-First** 🧪
```
Agent: 🧪 Phase 2: Test-First

Writing tests before implementation...

Created: tests/unit/App.test.tsx

Test cases:
✓ App component renders
✓ App has correct title
✓ App structure is valid

Run tests: npm test
Expected: All tests should FAIL (Red phase)

Tests written. Proceed to implementation? (yes/no)
```

**Phase 3: Implementation** ⚙️
```
Agent: ⚙️ Phase 3: Implementation

Implementing minimum code to pass tests...

Created/Modified:
- src/App.tsx
- src/main.tsx
- vite.config.ts

Run tests: npm test
Expected: All tests should PASS (Green phase)

Implementation complete. Proceed to refactoring? (yes/no)
```

**Phase 4: Refactoring** 🔧
```
Agent: 🔧 Phase 4: Refactoring

Improving code quality...

Refactored:
- Extracted reusable components
- Improved naming
- Added comments
- Optimized imports

Run tests: npm test
Expected: All tests still PASS

Refactoring complete. Proceed to acceptance? (yes/no)
```

**Phase 5: Acceptance** ✅
```
Agent: ✅ Phase 5: Acceptance

Verification checklist:
✓ All tests pass
✓ Code coverage > 80%
✓ ESLint passes
✓ Prettier formatted
✓ All acceptance criteria met

📊 Task Statistics:
- Files created: 5
- Files modified: 2
- Test cases: 8
- Code coverage: 85%

✅ Task T001 completed!

📝 Next task: T002 - Core logic implementation

Choose next action:
- /developer T002  (continue manual mode)
- /reviewer T001  (code review)
- /developer-auto T002  (switch to auto mode)
```

#### Option B: Automated Mode (For Speed)

**Command**: `/developer-auto` or `/developer-auto T001`

**What happens**:
```
Agent: ⚙️ Developer Agent - Automated Mode

Loading task status...
Found 10 tasks, 3 are executable

Execution plan:
1. T001: Project setup (2h)
2. T002: Core logic (3h) - after T001
3. T004: Feature A (2.5h) - after T001

Starting automated execution...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Progress: [████░░░░░░░░░░░░░░░░] 10%
Current: 1/10 - T001: Project setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Executes all 5 TDD phases automatically...]

✅ T001 completed
✅ T002 completed
✅ T004 completed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Automated execution complete!

Summary:
- Tasks completed: 3/10
- Time spent: ~7.5 hours
- Tests written: 24
- Code coverage: 83%

Next executable tasks:
- T003: UI components (depends on T002) ✅ Ready
- T005: Feature B (depends on T004) ✅ Ready

Continue automation? (yes/no)
```

---

### Phase 6: Testing

**Command**: `/tester T001`

**What the Tester does**:
1. Reviews task implementation
2. Creates comprehensive test strategy
3. Writes additional test cases
4. Performs integration testing
5. Generates test report

**Example**:
```
You: /tester T001

Agent: 🧪 Tester Agent Activated

Analyzing task T001...

Test Strategy:
1. Unit Tests: ✅ Already covered (85%)
2. Integration Tests: ⚠️ Need to add
3. E2E Tests: ⚠️ Need to add

Creating additional tests...

Created:
- tests/integration/app.integration.test.ts
- tests/e2e/app.e2e.test.ts

📊 Test Coverage:
- Unit: 85%
- Integration: 90%
- E2E: 75%
- Overall: 83%

📄 Generated: docs/test_report_T001.md
```

---

### Phase 7: Code Review

**Command**: `/reviewer T001`

**What the Reviewer does**:
1. Performs comprehensive code review
2. Checks code quality
3. Verifies best practices
4. Security audit
5. Performance analysis
6. Generates review report

**Example**:
```
You: /reviewer T001

Agent: 👁️ Reviewer Agent Activated

Reviewing task T001...

✅ Code Quality: Excellent
✅ Best Practices: Followed
✅ Security: No issues found
⚠️ Performance: Minor optimization possible
✅ Test Coverage: 85% (Good)

Suggestions:
1. Consider lazy loading for components
2. Add error boundaries
3. Optimize bundle size

📄 Generated: docs/review_report_T001.md
```

---

### Phase 8: Debugging (When Needed)

**Command**: `/debugger "error description"`

**What the Debugger does**:
1. Analyzes error description
2. Reproduces the issue
3. Identifies root cause
4. Proposes solutions
5. Implements fix
6. Verifies fix works

**Example**:
```
You: /debugger "App crashes when clicking submit button"

Agent: 🐛 Debugger Agent Activated

Analyzing error: "App crashes when clicking submit button"

🔍 Investigation:
1. Checking event handlers... ✓
2. Checking state management... ⚠️ Issue found
3. Checking data validation... ✓

🎯 Root Cause:
State update on unmounted component in handleSubmit()

💡 Solution:
Add cleanup in useEffect to cancel pending operations

Implementing fix...

✅ Fix applied
✅ Tests updated
✅ Verification passed

📄 Generated: docs/debug_report.md
```

---

## 🎭 Agent Usage Guide

### 1. Product Owner Agent

**When to use**:
- Starting a new project
- Adding major features
- Clarifying requirements

**Best practices**:
- Be specific about your goals
- Think about user needs
- Define clear success criteria

**Common mistakes**:
- Too vague requirements
- Skipping user stories
- No acceptance criteria

---

### 2. Architect Agent

**When to use**:
- After requirements are defined
- When choosing technology stack
- For system design decisions

**Best practices**:
- Consider team expertise
- Think about scalability
- Balance speed vs. robustness

**Common mistakes**:
- Over-engineering
- Ignoring constraints
- Not considering maintenance

---

### 3. Tech Lead Agent

**When to use**:
- After architecture is defined
- Before starting development
- When planning sprints

**Best practices**:
- Keep tasks small (< 4 hours)
- Define clear dependencies
- Set realistic estimates

**Common mistakes**:
- Tasks too large
- Missing dependencies
- Unrealistic estimates

---

### 4. Developer Agent

**When to use**:
- For every development task
- Both manual and auto modes

**Best practices**:
- Follow TDD strictly
- Write tests first
- Refactor regularly
- Keep commits small

**Common mistakes**:
- Skipping tests
- Not refactoring
- Ignoring code quality

---

### 5. Tester Agent

**When to use**:
- After task implementation
- Before code review
- For critical features

**Best practices**:
- Aim for >80% coverage
- Test edge cases
- Write integration tests

**Common mistakes**:
- Only unit tests
- Ignoring edge cases
- Low coverage

---

### 6. Reviewer Agent

**When to use**:
- After task completion
- Before merging code
- For quality assurance

**Best practices**:
- Review every task
- Check security
- Verify performance

**Common mistakes**:
- Skipping reviews
- Ignoring suggestions
- Not fixing issues

---

### 7. Debugger Agent

**When to use**:
- When encountering errors
- For performance issues
- For unexpected behavior

**Best practices**:
- Provide detailed error description
- Include reproduction steps
- Share error logs

**Common mistakes**:
- Vague descriptions
- No reproduction steps
- Skipping verification

---

## 💡 Best Practices

### Task Breakdown

**Good Task**:
```
ID: T001
Title: Implement user authentication
Time: 3 hours
Dependencies: None

Description:
Create login/logout functionality using JWT tokens

Acceptance Criteria:
- User can log in with email/password
- JWT token is stored securely
- User can log out
- Protected routes redirect to login
- Tests cover all scenarios

Files:
- src/auth/login.ts
- src/auth/logout.ts
- tests/auth/login.test.ts
```

**Bad Task**:
```
ID: T001
Title: Build the app
Time: 40 hours
Dependencies: Everything

Description:
Make the whole application work

Acceptance Criteria:
- App works
```

### TDD Development

**Do**:
✅ Write tests first
✅ Write minimum code to pass
✅ Refactor after green
✅ Keep tests fast
✅ Test edge cases

**Don't**:
❌ Skip tests
❌ Write implementation first
❌ Ignore failing tests
❌ Write slow tests
❌ Only test happy path

### Code Review

**Do**:
✅ Review every task
✅ Check for security issues
✅ Verify performance
✅ Ensure readability
✅ Validate tests

**Don't**:
❌ Skip reviews
❌ Ignore warnings
❌ Rush through
❌ Focus only on style
❌ Forget documentation

### Automated Mode

**When to use**:
- Repetitive tasks
- Well-defined requirements
- Stable architecture
- Experienced with the system

**When NOT to use**:
- Learning the system
- Complex/unclear tasks
- Experimental features
- Critical security code

---

## ❓ FAQ

### General Questions

**Q: Do I need to use all 7 agents?**  
A: No, use what you need. Minimum: Product Owner → Tech Lead → Developer.

**Q: Can I customize agent templates?**  
A: Yes! Edit files in `.claude-pilot/templates/`.

**Q: Does this work offline?**  
A: No, requires Claude Code connection.

**Q: Can I use this with existing projects?**  
A: Yes, run `claudecode-gpt init` in your project directory.

### Technical Questions

**Q: What if task.js doesn't work?**  
A: Ensure Node.js >= 14.0.0 and task_status.json exists.

**Q: How do I add custom commands?**  
A: Edit CLAUDE.md and add your commands.

**Q: Can I change the TDD workflow?**  
A: Yes, edit `developer.md` template.

**Q: How do I handle merge conflicts?**  
A: Use `/debugger "merge conflict in file.ts"`.

### Workflow Questions

**Q: Can I skip the Product Owner phase?**  
A: Not recommended, but you can create product_requirements.md manually.

**Q: What if I want to change architecture mid-project?**  
A: Run `/architect` again, but be prepared for refactoring.

**Q: How do I pause automated mode?**  
A: It runs task-by-task, so it pauses between tasks.

**Q: Can multiple people use the same project?**  
A: Yes, but coordinate task assignments in task_status.json.

---

## 🔧 Troubleshooting

### Installation Issues

**Problem**: `claudecode-gpt: command not found`

**Solution**:
```bash
# Check if installed
npm list -g claudecode-gpt

# Reinstall
npm install -g claudecode-gpt

# Or use npx
npx claudecode-gpt init --name "My Project"
```

---

**Problem**: `Permission denied` error

**Solution**:
```bash
# Use sudo (Linux/Mac)
sudo npm install -g claudecode-gpt

# Or fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

---

### Runtime Issues

**Problem**: `task_status.json not found`

**Solution**:
```bash
# Run Tech Lead first
# In Claude Code:
/tech-lead

# Or create manually
cp examples/sample-project/task_status.json ./
```

---

**Problem**: `Cannot find module 'task.js'`

**Solution**:
```bash
# Ensure task.js exists
ls .claude-pilot/tools/task.js

# If missing, copy from examples
cp examples/sample-project/.claude-pilot/tools/task.js .claude-pilot/tools/
```

---

**Problem**: Tests fail in automated mode

**Solution**:
1. Check error logs
2. Run `/debugger "test failure description"`
3. Fix the issue
4. Update task status: `node .claude-pilot/tools/task.js update T001 pending`
5. Retry: `/developer T001`

---

### Performance Issues

**Problem**: Automated mode is slow

**Solution**:
- Break down large tasks
- Run fewer tasks at once
- Use manual mode for complex tasks

---

**Problem**: High memory usage

**Solution**:
- Close unused applications
- Restart Claude Code
- Process fewer tasks simultaneously

---

## 🚀 Advanced Usage

### Custom Agent Templates

1. Edit template files in `.claude-pilot/templates/`
2. Add custom sections
3. Modify workflows
4. Save changes

Example:
```markdown
# In developer.md

## Custom Phase: Documentation

After Phase 5 (Acceptance), add:

### Phase 6: Documentation 📝

1. Update README.md
2. Add JSDoc comments
3. Create usage examples
4. Update CHANGELOG.md
```

### Extending task.js

Add custom functions to `.claude-pilot/tools/task.js`:

```javascript
// Add at the end of task.js

function getTasksByPriority(priority) {
  const taskStatus = loadTaskStatus();
  return taskStatus.tasks.filter(t => t.priority === priority);
}

function getBlockedTasks() {
  const taskStatus = loadTaskStatus();
  return taskStatus.tasks.filter(t => t.status === 'blocked');
}

// Export new functions
module.exports = {
  // ... existing exports
  getTasksByPriority,
  getBlockedTasks
};
```

### CI/CD Integration

**GitHub Actions Example**:

```yaml
name: GPT-Pilot CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Check task status
        run: node .claude-pilot/tools/task.js list
      
      - name: Run tests
        run: npm test
      
      - name: Check coverage
        run: npm run coverage
```

---

## 📚 Additional Resources

- [GitHub Repository](https://github.com/yourusername/claudecode-pilot)
- [Example Projects](../examples/)
- [Test Reports](./test-report-stage6.md)
- [Issue Tracker](https://github.com/yourusername/claudecode-pilot/issues)

---

**Happy Coding with Claude Code GPT-Pilot! 🚀**

