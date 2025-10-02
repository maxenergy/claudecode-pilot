#!/bin/bash

# Test script for Development Logging System
# Tests all logging functionality

set -e

echo "🧪 Testing Development Logging System"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  ((TESTS_PASSED++))
}

fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  ((TESTS_FAILED++))
}

info() {
  echo -e "${YELLOW}ℹ️  INFO${NC}: $1"
}

# Test 1: Check directory structure
echo "Test 1: Checking directory structure..."
if [ -d ".claude/logs/sessions" ] && \
   [ -d ".claude/logs/operations" ] && \
   [ -d ".claude/logs/decisions" ] && \
   [ -d ".claude/logs/errors" ]; then
  pass "Log directories exist"
else
  fail "Log directories missing"
fi
echo ""

# Test 2: Check logger.js exists and is executable
echo "Test 2: Checking logger.js..."
if [ -x ".claude/tools/logger.js" ]; then
  pass "logger.js is executable"
else
  fail "logger.js is not executable"
fi
echo ""

# Test 3: Check log-query.js exists and is executable
echo "Test 3: Checking log-query.js..."
if [ -x ".claude/tools/log-query.js" ]; then
  pass "log-query.js is executable"
else
  fail "log-query.js is not executable"
fi
echo ""

# Test 4: Test session logging
echo "Test 4: Testing session logging..."
SESSION_OUTPUT=$(node .claude/tools/logger.js log-session \
  --agent "test-agent" \
  --task-id "T000" \
  --user-input "Test user input" \
  --ai-response "Test AI response" 2>&1)

if echo "$SESSION_OUTPUT" | grep -q "Session logged"; then
  pass "Session logging works"
else
  fail "Session logging failed: $SESSION_OUTPUT"
fi
echo ""

# Test 5: Test operation logging
echo "Test 5: Testing operation logging..."
OPERATION_OUTPUT=$(node .claude/tools/logger.js log-operation \
  --type "test_operation" \
  --file "test.js" \
  --agent "test-agent" \
  --task-id "T000" 2>&1)

if echo "$OPERATION_OUTPUT" | grep -q "Operation logged"; then
  pass "Operation logging works"
else
  fail "Operation logging failed: $OPERATION_OUTPUT"
fi
echo ""

# Test 6: Test error logging
echo "Test 6: Testing error logging..."
ERROR_OUTPUT=$(node .claude/tools/logger.js log-error \
  --agent "test-agent" \
  --task-id "T000" \
  --error-type "test_error" \
  --error-message "This is a test error" 2>&1)

if echo "$ERROR_OUTPUT" | grep -q "Error logged"; then
  pass "Error logging works"
else
  fail "Error logging failed: $ERROR_OUTPUT"
fi
echo ""

# Test 7: Test decision logging (ADR)
echo "Test 7: Testing decision logging (ADR)..."
DECISION_OUTPUT=$(node .claude/tools/logger.js log-decision \
  --number 1 \
  --title "Test Decision" \
  --background "This is a test background" \
  --decision "This is a test decision" \
  --agent "test-agent" \
  --task "T000" 2>&1)

if echo "$DECISION_OUTPUT" | grep -q "Decision logged"; then
  pass "Decision logging works"
  
  # Check if ADR file was created
  if [ -f ".claude/logs/decisions/ADR-001.md" ]; then
    pass "ADR file created"
  else
    fail "ADR file not created"
  fi
else
  fail "Decision logging failed: $DECISION_OUTPUT"
fi
echo ""

# Test 8: Test querying sessions
echo "Test 8: Testing session query..."
QUERY_OUTPUT=$(node .claude/tools/log-query.js sessions --format summary 2>&1)

if echo "$QUERY_OUTPUT" | grep -q "Found"; then
  pass "Session query works"
else
  fail "Session query failed: $QUERY_OUTPUT"
fi
echo ""

# Test 9: Test querying operations
echo "Test 9: Testing operation query..."
QUERY_OUTPUT=$(node .claude/tools/log-query.js operations --format summary 2>&1)

if echo "$QUERY_OUTPUT" | grep -q "Found"; then
  pass "Operation query works"
else
  fail "Operation query failed: $QUERY_OUTPUT"
fi
echo ""

# Test 10: Test querying errors
echo "Test 10: Testing error query..."
QUERY_OUTPUT=$(node .claude/tools/log-query.js errors --format summary 2>&1)

if echo "$QUERY_OUTPUT" | grep -q "Found"; then
  pass "Error query works"
else
  fail "Error query failed: $QUERY_OUTPUT"
fi
echo ""

# Test 11: Test listing decisions
echo "Test 11: Testing decision list..."
QUERY_OUTPUT=$(node .claude/tools/log-query.js decisions 2>&1)

if echo "$QUERY_OUTPUT" | grep -q "ADR-001"; then
  pass "Decision list works"
else
  fail "Decision list failed: $QUERY_OUTPUT"
fi
echo ""

# Test 12: Test generating report
echo "Test 12: Testing report generation..."
REPORT_OUTPUT=$(node .claude/tools/log-query.js report T000 2>&1)

if echo "$REPORT_OUTPUT" | grep -q "task_id"; then
  pass "Report generation works"
else
  fail "Report generation failed: $REPORT_OUTPUT"
fi
echo ""

# Test 13: Test statistics
echo "Test 13: Testing statistics..."
STATS_OUTPUT=$(node .claude/tools/log-query.js stats 2>&1)

if echo "$STATS_OUTPUT" | grep -q "total_sessions"; then
  pass "Statistics generation works"
else
  fail "Statistics generation failed: $STATS_OUTPUT"
fi
echo ""

# Test 14: Verify JSONL format
echo "Test 14: Verifying JSONL format..."
TODAY=$(date +%Y-%m-%d)
SESSION_FILE=".claude/logs/sessions/$TODAY/sessions.jsonl"

if [ -f "$SESSION_FILE" ]; then
  # Try to parse each line as JSON
  VALID_JSON=true
  while IFS= read -r line; do
    if [ -n "$line" ]; then
      if ! echo "$line" | jq . > /dev/null 2>&1; then
        VALID_JSON=false
        break
      fi
    fi
  done < "$SESSION_FILE"
  
  if [ "$VALID_JSON" = true ]; then
    pass "JSONL format is valid"
  else
    fail "JSONL format is invalid"
  fi
else
  fail "Session log file not found: $SESSION_FILE"
fi
echo ""

# Test 15: Check file permissions
echo "Test 15: Checking file permissions..."
if [ -r "$SESSION_FILE" ] && [ -w "$SESSION_FILE" ]; then
  pass "Log files have correct permissions"
else
  fail "Log files have incorrect permissions"
fi
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi

