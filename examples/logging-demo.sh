#!/bin/bash

# Logging System Demo
# Demonstrates all logging features

set -e

echo "🎬 Development Logging System Demo"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

step() {
  echo -e "${BLUE}▶ $1${NC}"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Demo 1: Session Logging
step "Demo 1: Recording a development session"
node .claude/tools/logger.js log-session \
  --agent "developer" \
  --task-id "DEMO-001" \
  --user-input "Implement user authentication" \
  --ai-response "I will implement JWT-based authentication using TDD approach"
success "Session logged"
echo ""

# Demo 2: Operation Logging - File Creation
step "Demo 2: Recording file creation"
node .claude/tools/logger.js log-operation \
  --type "file_create" \
  --file "src/auth/jwt.js" \
  --agent "developer" \
  --task-id "DEMO-001"
success "File creation logged"
echo ""

# Demo 3: Operation Logging - Test Run
step "Demo 3: Recording test execution"
node .claude/tools/logger.js log-operation \
  --type "test_run" \
  --command "npm test" \
  --result "All tests passed (10/10)" \
  --agent "developer" \
  --task-id "DEMO-001"
success "Test execution logged"
echo ""

# Demo 4: Error Logging
step "Demo 4: Recording an error"
node .claude/tools/logger.js log-error \
  --agent "developer" \
  --task-id "DEMO-001" \
  --error-type "test_failure" \
  --error-message "JWT signature verification failed"
success "Error logged"
echo ""

# Demo 5: Decision Logging (ADR)
step "Demo 5: Recording an architecture decision"
node .claude/tools/logger.js log-decision \
  --number 999 \
  --title "Use JWT for Authentication (Demo)" \
  --background "Need stateless authentication for scalability" \
  --decision "Implement JWT tokens with RS256 signing" \
  --agent "architect" \
  --task "DEMO-001"
success "Architecture decision logged"
echo ""

# Demo 6: Query Sessions
step "Demo 6: Querying sessions"
info "All sessions for DEMO-001:"
node .claude/tools/log-query.js sessions --task-id DEMO-001 --format summary
echo ""

# Demo 7: Query Operations
step "Demo 7: Querying operations"
info "All operations for DEMO-001:"
node .claude/tools/log-query.js operations --task-id DEMO-001 --format summary
echo ""

# Demo 8: Query Errors
step "Demo 8: Querying errors"
info "All errors for DEMO-001:"
node .claude/tools/log-query.js errors --task-id DEMO-001 --format summary
echo ""

# Demo 9: List Decisions
step "Demo 9: Listing architecture decisions"
info "All ADRs:"
node .claude/tools/log-query.js decisions --format summary
echo ""

# Demo 10: Generate Report
step "Demo 10: Generating task report"
info "Full report for DEMO-001:"
node .claude/tools/log-query.js report DEMO-001
echo ""

# Demo 11: Statistics
step "Demo 11: Viewing overall statistics"
info "Overall statistics:"
node .claude/tools/log-query.js stats
echo ""

# Summary
echo "===================================="
echo -e "${GREEN}🎉 Demo completed successfully!${NC}"
echo ""
echo "What was demonstrated:"
echo "  ✅ Session logging"
echo "  ✅ Operation logging (file creation, test execution)"
echo "  ✅ Error logging"
echo "  ✅ Architecture decision recording (ADR)"
echo "  ✅ Querying logs by task ID"
echo "  ✅ Generating task reports"
echo "  ✅ Viewing statistics"
echo ""
echo "Log files created:"
echo "  📁 .claude/logs/sessions/$(date +%Y-%m-%d)/sessions.jsonl"
echo "  📁 .claude/logs/operations/$(date +%Y-%m-%d)/operations.jsonl"
echo "  📁 .claude/logs/errors/$(date +%Y-%m-%d)/errors.jsonl"
echo "  📁 .claude/logs/decisions/ADR-999.md"
echo ""
echo "Next steps:"
echo "  1. View the usage guide: docs/logging-usage-guide.md"
echo "  2. Integrate logging into your agents"
echo "  3. Query logs to analyze development process"
echo ""

