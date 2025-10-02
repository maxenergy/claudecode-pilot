# 📝 开发日志系统使用指南

> **版本**: 1.0.0  
> **日期**: 2025-10-02  
> **状态**: 已实施

---

## 📋 目录

1. [概述](#概述)
2. [快速开始](#快速开始)
3. [记录日志](#记录日志)
4. [查询日志](#查询日志)
5. [集成到 Agent](#集成到-agent)
6. [最佳实践](#最佳实践)

---

## 🎯 概述

开发日志系统为 Claude Code GPT-Pilot 提供完整的开发过程记录功能，包括：

- **会话日志**: 记录 AI 与用户的所有对话
- **操作日志**: 记录文件操作、命令执行
- **决策日志**: 记录架构决策 (ADR)
- **错误日志**: 记录错误和解决方案

### 目录结构

```
.claude/logs/
├── sessions/              # 会话日志
│   └── 2025-10-02/
│       └── sessions.jsonl
├── operations/            # 操作日志
│   └── 2025-10-02/
│       └── operations.jsonl
├── decisions/             # 决策日志 (ADR)
│   └── ADR-001.md
└── errors/                # 错误日志
    └── 2025-10-02/
        └── errors.jsonl
```

---

## 🚀 快速开始

### 1. 记录一个会话

```bash
node .claude/tools/logger.js log-session \
  --agent "developer" \
  --task-id "T001" \
  --user-input "实现用户登录功能" \
  --ai-response "我将使用 TDD 方式实现..."
```

### 2. 查询会话

```bash
# 查看所有会话
node .claude/tools/log-query.js sessions

# 查看特定任务的会话
node .claude/tools/log-query.js sessions --task-id T001
```

### 3. 生成报告

```bash
# 生成任务报告
node .claude/tools/log-query.js report T001
```

---

## 📝 记录日志

### 会话日志

**用途**: 记录 AI 与用户的对话

**命令**:
```bash
node .claude/tools/logger.js log-session \
  --agent <agent-name> \
  --task-id <task-id> \
  --user-input <user-input> \
  --ai-response <ai-response> \
  [--context <json>]
```

**参数**:
- `--agent`: Agent 名称 (developer, architect, tester 等)
- `--task-id`: 任务 ID (如 T001)
- `--user-input`: 用户输入
- `--ai-response`: AI 响应
- `--context`: 额外上下文 (JSON 格式，可选)

**示例**:
```bash
node .claude/tools/logger.js log-session \
  --agent "developer" \
  --task-id "T001" \
  --user-input "实现用户登录功能" \
  --ai-response "我将使用 TDD 方式实现，首先编写测试..."
```

**输出格式** (JSONL):
```json
{
  "session_id": "uuid",
  "timestamp": "2025-10-02T10:30:00Z",
  "agent": "developer",
  "task_id": "T001",
  "user_input": "实现用户登录功能",
  "ai_response": "我将使用 TDD 方式实现...",
  "context": {}
}
```

---

### 操作日志

**用途**: 记录文件操作、命令执行

**命令**:
```bash
node .claude/tools/logger.js log-operation \
  --type <operation-type> \
  [--file <file-path>] \
  [--command <command>] \
  [--result <result>] \
  [--agent <agent-name>] \
  [--task-id <task-id>]
```

**操作类型**:
- `file_create`: 创建文件
- `file_modify`: 修改文件
- `file_delete`: 删除文件
- `command_run`: 运行命令
- `test_run`: 运行测试
- `git_commit`: Git 提交

**示例**:
```bash
# 记录文件创建
node .claude/tools/logger.js log-operation \
  --type "file_create" \
  --file "src/auth/login.js" \
  --agent "developer" \
  --task-id "T001"

# 记录命令执行
node .claude/tools/logger.js log-operation \
  --type "command_run" \
  --command "npm test" \
  --result "All tests passed" \
  --agent "developer" \
  --task-id "T001"
```

**输出格式** (JSONL):
```json
{
  "operation_id": "uuid",
  "timestamp": "2025-10-02T10:31:00Z",
  "type": "file_create",
  "file": "src/auth/login.js",
  "agent": "developer",
  "task_id": "T001"
}
```

---

### 决策日志 (ADR)

**用途**: 记录架构决策

**命令**:
```bash
node .claude/tools/logger.js log-decision \
  --number <adr-number> \
  --title <title> \
  --background <background> \
  --decision <decision> \
  [--agent <agent-name>] \
  [--task <task-id>]
```

**示例**:
```bash
node .claude/tools/logger.js log-decision \
  --number 1 \
  --title "选择 JWT 作为认证方式" \
  --background "需要实现用户认证功能，要求无状态、易于扩展" \
  --decision "使用 JWT (JSON Web Token) 作为认证方式" \
  --agent "architect" \
  --task "T001"
```

**输出格式** (Markdown):
```markdown
# ADR-001: 选择 JWT 作为认证方式

**日期**: 2025-10-02  
**状态**: 已接受  
**Agent**: architect  
**任务**: T001

## 背景

需要实现用户认证功能，要求无状态、易于扩展

## 决策

使用 JWT (JSON Web Token) 作为认证方式

## 替代方案

## 后果

### 正面

### 负面
```

---

### 错误日志

**用途**: 记录错误和异常

**命令**:
```bash
node .claude/tools/logger.js log-error \
  --agent <agent-name> \
  --task-id <task-id> \
  --error-type <error-type> \
  --error-message <error-message> \
  [--stack-trace <stack-trace>]
```

**错误类型**:
- `test_failure`: 测试失败
- `build_error`: 编译错误
- `runtime_error`: 运行时错误
- `dependency_error`: 依赖错误

**示例**:
```bash
node .claude/tools/logger.js log-error \
  --agent "developer" \
  --task-id "T001" \
  --error-type "test_failure" \
  --error-message "Expected 200, got 401"
```

**输出格式** (JSONL):
```json
{
  "error_id": "uuid",
  "timestamp": "2025-10-02T10:32:00Z",
  "agent": "developer",
  "task_id": "T001",
  "error_type": "test_failure",
  "error_message": "Expected 200, got 401",
  "stack_trace": "",
  "context": {},
  "resolution": null
}
```

---

## 🔍 查询日志

### 查询会话

```bash
# 查看所有会话
node .claude/tools/log-query.js sessions

# 按 Agent 过滤
node .claude/tools/log-query.js sessions --agent developer

# 按任务过滤
node .claude/tools/log-query.js sessions --task-id T001

# 简洁输出
node .claude/tools/log-query.js sessions --format summary
```

### 查询操作

```bash
# 查看所有操作
node .claude/tools/log-query.js operations

# 按类型过滤
node .claude/tools/log-query.js operations --type file_create

# 按任务过滤
node .claude/tools/log-query.js operations --task-id T001
```

### 查询错误

```bash
# 查看所有错误
node .claude/tools/log-query.js errors

# 按任务过滤
node .claude/tools/log-query.js errors --task-id T001
```

### 查看决策

```bash
# 列出所有 ADR
node .claude/tools/log-query.js decisions
```

### 生成报告

```bash
# 生成任务报告
node .claude/tools/log-query.js report T001

# 输出包括:
# - 会话数量
# - 操作数量
# - 错误数量
# - 时间线
# - 操作类型统计
# - 错误类型统计
```

### 查看统计

```bash
# 查看整体统计
node .claude/tools/log-query.js stats

# 输出包括:
# - 总会话数
# - 总操作数
# - 总错误数
# - 总决策数
# - Agent 统计
# - 操作类型统计
# - 错误类型统计
# - 任务统计
```

---

## 🔧 集成到 Agent

### 在 Bash 脚本中使用

```bash
#!/bin/bash

# 在 developer.md 命令中集成日志

TASK_ID="$1"
AGENT="developer"

# 记录会话开始
node .claude/tools/logger.js log-session \
  --agent "$AGENT" \
  --task-id "$TASK_ID" \
  --user-input "开始执行任务 $TASK_ID" \
  --ai-response "准备执行 TDD 流程"

# 记录文件创建
create_file() {
  local file="$1"
  # ... 创建文件的代码 ...
  
  node .claude/tools/logger.js log-operation \
    --type "file_create" \
    --file "$file" \
    --agent "$AGENT" \
    --task-id "$TASK_ID"
}

# 记录测试运行
run_tests() {
  local result=$(npm test 2>&1)
  
  node .claude/tools/logger.js log-operation \
    --type "test_run" \
    --command "npm test" \
    --result "$result" \
    --agent "$AGENT" \
    --task-id "$TASK_ID"
}

# 记录错误
handle_error() {
  local error_msg="$1"
  
  node .claude/tools/logger.js log-error \
    --agent "$AGENT" \
    --task-id "$TASK_ID" \
    --error-type "test_failure" \
    --error-message "$error_msg"
}
```

---

## 💡 最佳实践

### 1. 何时记录日志

**应该记录**:
- ✅ 每次 AI 与用户的对话
- ✅ 所有文件的创建、修改、删除
- ✅ 所有命令执行
- ✅ 所有测试运行
- ✅ 所有错误和异常
- ✅ 重要的架构决策

**不需要记录**:
- ❌ 临时文件操作
- ❌ 调试信息
- ❌ 敏感信息（密码、API 密钥）

### 2. 日志内容规范

- **简洁明了**: 日志信息应该简洁，避免冗长
- **结构化**: 使用 JSON 格式，便于解析
- **时间戳**: 自动添加，无需手动指定
- **上下文**: 包含足够的上下文信息（任务 ID、文件路径等）

### 3. 隐私和安全

- **不记录敏感信息**: API 密钥、密码、个人身份信息
- **本地存储**: 所有日志存储在本地 `.claude/logs/`
- **添加到 .gitignore**: 防止日志被提交到版本控制

### 4. 日志维护

- **定期清理**: 建议保留最近 30 天的日志
- **归档旧日志**: 可以将旧日志压缩归档
- **监控磁盘空间**: 定期检查日志占用的磁盘空间

---

## 📊 示例工作流

### 完整的开发任务日志

```bash
# 1. 开始任务
node .claude/tools/logger.js log-session \
  --agent "developer" \
  --task-id "T001" \
  --user-input "实现用户登录功能" \
  --ai-response "开始 TDD 流程"

# 2. 创建测试文件
node .claude/tools/logger.js log-operation \
  --type "file_create" \
  --file "tests/auth.test.js" \
  --agent "developer" \
  --task-id "T001"

# 3. 运行测试（失败）
node .claude/tools/logger.js log-operation \
  --type "test_run" \
  --command "npm test" \
  --result "FAILED" \
  --agent "developer" \
  --task-id "T001"

# 4. 创建实现文件
node .claude/tools/logger.js log-operation \
  --type "file_create" \
  --file "src/auth/login.js" \
  --agent "developer" \
  --task-id "T001"

# 5. 运行测试（成功）
node .claude/tools/logger.js log-operation \
  --type "test_run" \
  --command "npm test" \
  --result "PASSED" \
  --agent "developer" \
  --task-id "T001"

# 6. 查看任务报告
node .claude/tools/log-query.js report T001
```

---

## 🔗 相关文档

- `docs/development-logging-research.md` - 研究报告
- `docs/tasks-completion-summary.md` - 任务完成总结
- `.claude/tools/logger.js` - 日志记录工具源码
- `.claude/tools/log-query.js` - 日志查询工具源码

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-02

