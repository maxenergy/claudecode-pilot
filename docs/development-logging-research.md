# 🔍 开发过程记录系统研究报告

> **日期**: 2025-10-02  
> **研究目标**: 为 Claude Code GPT-Pilot 实现完整的开发过程记录功能  
> **研究方法**: Web Search + 本地文件系统分析

---

## 📋 目录

1. [研究发现](#研究发现)
2. [Claude Code 内置功能](#claude-code-内置功能)
3. [业界最佳实践](#业界最佳实践)
4. [现有工具和框架](#现有工具和框架)
5. [实现方案建议](#实现方案建议)
6. [集成步骤](#集成步骤)

---

## 🔍 研究发现

### 核心发现

1. ✅ **Claude Code 有内置的会话记录功能**
   - 位置: `~/.claude/`
   - 格式: JSONL (JSON Lines)
   - 自动记录所有对话

2. ✅ **会话日志结构清晰**
   - 全局历史: `~/.claude/history.jsonl`
   - 项目会话: `~/.claude/projects/<project-path>/<session-id>.jsonl`
   - 文件历史: `~/.claude/file-history/`

3. ✅ **业界有成熟的 AI 可观测性工具**
   - LangSmith (LangChain)
   - OpenTelemetry
   - 自定义日志系统

---

## 📁 Claude Code 内置功能

### 1. 目录结构

```
~/.claude/
├── history.jsonl              # 全局命令历史
├── projects/                  # 项目会话目录
│   └── -home-rogers-source-streaming-AIOTSystem/
│       ├── 9da7e452-41f0-44f7-8ad9-b010a084e6e2.jsonl  # 会话文件
│       ├── 9d5b84a8-20cb-4fb4-b11f-f519bd8e24fb.jsonl
│       └── ...
├── file-history/              # 文件变更历史
├── shell-snapshots/           # Shell 快照
├── todos/                     # 任务列表
└── .credentials.json          # 凭证（敏感）
```

### 2. 文件格式

#### `history.jsonl` 格式

```json
{
  "display": "/init ",
  "pastedContents": {},
  "timestamp": 1759193186933,
  "project": "/home/rogers/temp/PDMQt5"
}
```

**字段说明**:
- `display`: 用户输入的命令或消息
- `pastedContents`: 粘贴的内容
- `timestamp`: Unix 时间戳（毫秒）
- `project`: 项目路径

#### 项目会话文件格式

```json
{
  "type": "summary",
  "summary": "Debugging Python Web Scraper with Selenium and BeautifulSoup",
  "leafUuid": "48b3a295-d9fc-47c0-a8ca-eb14a116b3cc"
}
```

**字段说明**:
- `type`: 消息类型（summary, message, tool_call 等）
- `summary`: 会话摘要
- `leafUuid`: 会话节点 UUID

### 3. 优点

✅ **自动记录**: 无需额外配置  
✅ **结构化数据**: JSONL 格式易于解析  
✅ **按项目组织**: 每个项目独立的会话历史  
✅ **时间戳**: 精确到毫秒  
✅ **完整性**: 记录所有交互

### 4. 缺点

❌ **格式不够详细**: 缺少 AI 响应内容  
❌ **无工具调用记录**: 不记录具体的工具调用参数  
❌ **无决策记录**: 不记录技术决策过程  
❌ **无错误追踪**: 不记录错误和异常  
❌ **隐私问题**: 所有内容都被记录

---

## 🌐 业界最佳实践

### 1. Architecture Decision Records (ADR)

**来源**: AWS, Microsoft Azure, GitHub

**核心概念**:
- 记录所有重要的架构决策
- 包含背景、决策、后果
- 使用 Markdown 格式
- 版本控制

**示例结构**:
```markdown
# ADR-001: 选择 React 作为前端框架

## 状态
已接受

## 背景
需要选择一个现代化的前端框架...

## 决策
选择 React 作为前端框架

## 后果
### 正面
- 生态系统丰富
- 社区活跃

### 负面
- 学习曲线陡峭
```

**参考资料**:
- [ADR GitHub](https://adr.github.io/)
- [AWS ADR Guide](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/)

### 2. LangSmith (LangChain)

**功能**:
- ✅ LLM 调用追踪
- ✅ 性能监控
- ✅ 成本分析
- ✅ 错误追踪
- ✅ 评估和测试

**优点**:
- 专为 AI 应用设计
- 可视化界面
- 与 LangChain 深度集成

**缺点**:
- 需要付费（免费版有限制）
- 需要网络连接
- 与 Claude Code 集成需要额外工作

**参考资料**:
- [LangSmith 官网](https://www.langchain.com/)
- [LangSmith 文档](https://docs.smith.langchain.com/)

### 3. OpenTelemetry

**功能**:
- ✅ 分布式追踪
- ✅ 指标收集
- ✅ 日志聚合
- ✅ 标准化格式

**优点**:
- 开源免费
- 行业标准
- 灵活可扩展

**缺点**:
- 配置复杂
- 需要额外的基础设施

---

## 🛠️ 现有工具和框架

### 1. Claude Code History Viewer (macOS)

**来源**: Hacker News, Reddit

**功能**:
- 读取 `~/.claude/` 目录
- 可视化会话历史
- 按项目组织

**限制**:
- 仅支持 macOS
- 只读功能
- 不支持导出

### 2. SpecStory

**来源**: Reddit r/ClaudeAI

**功能**:
- 自动记录 Claude Code 会话
- 导出到 AWS CloudWatch
- 按项目组织

**优点**:
- 无缝集成
- 自动化

**缺点**:
- 需要 AWS 账号
- 可能有成本

### 3. 自定义 JSONL 转 Markdown 工具

**来源**: GitHub Issues

**功能**:
- 将 JSONL 格式转换为 Markdown
- 便于阅读和归档

**实现**:
```bash
# 简单的转换脚本
cat session.jsonl | jq -r '.summary' > session.md
```

---

## 💡 实现方案建议

### 方案A: 增强 Claude Code 内置日志（推荐）

**核心思路**: 在现有 `~/.claude/` 基础上，添加额外的结构化日志

**优点**:
- ✅ 利用现有基础设施
- ✅ 无需额外配置
- ✅ 与 Claude Code 深度集成
- ✅ 本地存储，隐私安全

**实现**:
1. 创建 `.claude/logs/` 目录
2. 记录详细的交互日志
3. 记录工具调用和结果
4. 记录决策过程
5. 提供查询和分析工具

**目录结构**:
```
.claude/
├── logs/
│   ├── sessions/              # 会话日志
│   │   └── 2025-10-02/
│   │       └── session-001.jsonl
│   ├── operations/            # 操作日志
│   │   └── 2025-10-02/
│   │       └── operations.jsonl
│   ├── decisions/             # 决策日志
│   │   └── ADR-001.md
│   └── errors/                # 错误日志
│       └── 2025-10-02/
│           └── errors.jsonl
└── tools/
    └── log-analyzer.js        # 日志分析工具
```

### 方案B: 集成 LangSmith

**核心思路**: 使用 LangSmith 作为外部可观测性平台

**优点**:
- ✅ 专业的 AI 可观测性工具
- ✅ 可视化界面
- ✅ 强大的分析功能

**缺点**:
- ❌ 需要付费
- ❌ 需要网络连接
- ❌ 数据存储在外部

**实现**:
1. 安装 LangSmith SDK
2. 配置 API 密钥
3. 在 Agent 命令中添加追踪代码
4. 导出日志到 LangSmith

### 方案C: 自定义日志系统

**核心思路**: 完全自定义的日志系统

**优点**:
- ✅ 完全控制
- ✅ 灵活定制
- ✅ 本地存储

**缺点**:
- ❌ 开发工作量大
- ❌ 需要维护

---

## 🎯 推荐方案: 方案A（增强 Claude Code 内置日志）

### 为什么选择方案A？

1. **最小侵入性**: 利用现有的 `~/.claude/` 目录
2. **隐私安全**: 所有数据本地存储
3. **无额外成本**: 不需要付费服务
4. **易于集成**: 与现有 GPT-Pilot 系统无缝集成
5. **灵活扩展**: 可以根据需求逐步增强

### 核心功能

#### 1. 会话日志增强

**记录内容**:
```json
{
  "session_id": "uuid",
  "timestamp": "2025-10-02T10:30:00Z",
  "agent": "developer",
  "task_id": "T001",
  "user_input": "实现用户登录功能",
  "ai_response": "我将使用 TDD 方式实现...",
  "context": {
    "files": ["src/auth/login.js"],
    "dependencies": ["T000"]
  }
}
```

#### 2. 操作日志

**记录内容**:
```json
{
  "operation_id": "uuid",
  "timestamp": "2025-10-02T10:31:00Z",
  "type": "file_create",
  "file": "src/auth/login.js",
  "content_hash": "sha256...",
  "agent": "developer",
  "task_id": "T001"
}
```

#### 3. 决策日志 (ADR)

**格式**: Markdown

**位置**: `.claude/logs/decisions/ADR-XXX.md`

**模板**:
```markdown
# ADR-001: 选择 JWT 作为认证方式

**日期**: 2025-10-02  
**状态**: 已接受  
**Agent**: architect  
**任务**: T001

## 背景
需要实现用户认证功能...

## 决策
使用 JWT (JSON Web Token) 作为认证方式

## 替代方案
1. Session-based authentication
2. OAuth 2.0

## 后果
### 正面
- 无状态
- 易于扩展

### 负面
- Token 无法撤销
```

#### 4. 错误日志

**记录内容**:
```json
{
  "error_id": "uuid",
  "timestamp": "2025-10-02T10:32:00Z",
  "agent": "developer",
  "task_id": "T001",
  "error_type": "test_failure",
  "error_message": "Expected 200, got 401",
  "stack_trace": "...",
  "context": {
    "file": "tests/auth.test.js",
    "line": 42
  },
  "resolution": "修复了 JWT 签名验证逻辑"
}
```

---

## 📊 数据格式设计

### 1. JSONL 格式（推荐）

**优点**:
- 易于追加
- 易于解析
- 与 Claude Code 一致

**示例**:
```jsonl
{"type":"session","timestamp":"2025-10-02T10:30:00Z","agent":"developer","message":"..."}
{"type":"operation","timestamp":"2025-10-02T10:31:00Z","operation":"file_create","file":"..."}
```

### 2. Markdown 格式（用于决策日志）

**优点**:
- 人类可读
- 易于版本控制
- 支持富文本

### 3. SQLite 数据库（可选）

**优点**:
- 强大的查询能力
- 关系型数据
- 本地存储

**缺点**:
- 需要额外的工具
- 复杂度增加

---

## 🔒 隐私和安全

### 1. 敏感信息处理

**策略**:
- ❌ 不记录 API 密钥
- ❌ 不记录密码
- ❌ 不记录个人身份信息
- ✅ 记录文件路径（相对路径）
- ✅ 记录代码片段（可配置）

### 2. 数据加密

**可选**:
- 使用 GPG 加密日志文件
- 使用密码保护的 ZIP 归档

### 3. 数据保留策略

**建议**:
- 保留最近 30 天的详细日志
- 归档 30 天以上的日志
- 定期清理敏感数据

---

---

## 🔧 集成步骤

### 步骤1: 创建日志目录结构

```bash
# 在项目根目录执行
mkdir -p .claude/logs/{sessions,operations,decisions,errors}
mkdir -p .claude/tools
```

### 步骤2: 创建日志工具

**文件**: `.claude/tools/logger.js`

```javascript
const fs = require('fs');
const path = require('path');

class DevelopmentLogger {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.logsDir = path.join(projectRoot, '.claude/logs');
  }

  // 记录会话
  logSession(agent, taskId, userInput, aiResponse, context = {}) {
    const log = {
      session_id: this.generateUUID(),
      timestamp: new Date().toISOString(),
      agent,
      task_id: taskId,
      user_input: userInput,
      ai_response: aiResponse,
      context
    };

    this.appendToFile('sessions', log);
  }

  // 记录操作
  logOperation(type, details) {
    const log = {
      operation_id: this.generateUUID(),
      timestamp: new Date().toISOString(),
      type,
      ...details
    };

    this.appendToFile('operations', log);
  }

  // 记录决策 (ADR)
  logDecision(adrNumber, title, content) {
    const filename = `ADR-${String(adrNumber).padStart(3, '0')}.md`;
    const filepath = path.join(this.logsDir, 'decisions', filename);
    fs.writeFileSync(filepath, content, 'utf8');
  }

  // 记录错误
  logError(agent, taskId, error) {
    const log = {
      error_id: this.generateUUID(),
      timestamp: new Date().toISOString(),
      agent,
      task_id: taskId,
      error_type: error.type || 'unknown',
      error_message: error.message,
      stack_trace: error.stack,
      context: error.context || {}
    };

    this.appendToFile('errors', log);
  }

  // 辅助方法
  appendToFile(category, data) {
    const date = new Date().toISOString().split('T')[0];
    const dir = path.join(this.logsDir, category, date);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = path.join(dir, `${category}.jsonl`);
    const line = JSON.stringify(data) + '\n';
    fs.appendFileSync(filename, line, 'utf8');
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = DevelopmentLogger;
```

### 步骤3: 集成到 Agent 命令

**修改**: `.claude/commands/developer.md`

在命令开头添加日志记录：

```bash
# 初始化日志记录器
if [ -f .claude/tools/logger.js ]; then
  LOGGER_ENABLED=true
else
  LOGGER_ENABLED=false
fi

# 记录会话开始
if [ "$LOGGER_ENABLED" = "true" ]; then
  node .claude/tools/logger.js log-session \
    --agent "developer" \
    --task-id "$TASK_ID" \
    --user-input "开始执行任务 $TASK_ID" \
    --ai-response "准备执行 TDD 流程"
fi
```

### 步骤4: 记录关键操作

在每个关键步骤后添加日志：

```bash
# 创建文件后
if [ "$LOGGER_ENABLED" = "true" ]; then
  node .claude/tools/logger.js log-operation \
    --type "file_create" \
    --file "$FILE_PATH" \
    --agent "developer" \
    --task-id "$TASK_ID"
fi

# 运行测试后
if [ "$LOGGER_ENABLED" = "true" ]; then
  node .claude/tools/logger.js log-operation \
    --type "test_run" \
    --result "$TEST_RESULT" \
    --agent "developer" \
    --task-id "$TASK_ID"
fi
```

### 步骤5: 创建日志查询工具

**文件**: `.claude/tools/log-query.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class LogQuery {
  constructor(logsDir) {
    this.logsDir = logsDir;
  }

  // 查询会话日志
  querySessions(filters = {}) {
    const sessions = this.readLogs('sessions');
    return this.applyFilters(sessions, filters);
  }

  // 查询操作日志
  queryOperations(filters = {}) {
    const operations = this.readLogs('operations');
    return this.applyFilters(operations, filters);
  }

  // 查询错误日志
  queryErrors(filters = {}) {
    const errors = this.readLogs('errors');
    return this.applyFilters(errors, filters);
  }

  // 生成报告
  generateReport(taskId) {
    const sessions = this.querySessions({ task_id: taskId });
    const operations = this.queryOperations({ task_id: taskId });
    const errors = this.queryErrors({ task_id: taskId });

    return {
      task_id: taskId,
      sessions_count: sessions.length,
      operations_count: operations.length,
      errors_count: errors.length,
      timeline: this.buildTimeline(sessions, operations, errors)
    };
  }

  // 辅助方法
  readLogs(category) {
    const categoryDir = path.join(this.logsDir, category);
    const logs = [];

    if (!fs.existsSync(categoryDir)) {
      return logs;
    }

    // 递归读取所有日期目录
    const dateDirs = fs.readdirSync(categoryDir);
    dateDirs.forEach(dateDir => {
      const logFile = path.join(categoryDir, dateDir, `${category}.jsonl`);
      if (fs.existsSync(logFile)) {
        const lines = fs.readFileSync(logFile, 'utf8').split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            logs.push(JSON.parse(line));
          }
        });
      }
    });

    return logs;
  }

  applyFilters(logs, filters) {
    return logs.filter(log => {
      for (const [key, value] of Object.entries(filters)) {
        if (log[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  buildTimeline(sessions, operations, errors) {
    const events = [
      ...sessions.map(s => ({ ...s, event_type: 'session' })),
      ...operations.map(o => ({ ...o, event_type: 'operation' })),
      ...errors.map(e => ({ ...e, event_type: 'error' }))
    ];

    return events.sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const logsDir = path.join(process.cwd(), '.claude/logs');
  const query = new LogQuery(logsDir);

  switch (command) {
    case 'sessions':
      console.log(JSON.stringify(query.querySessions(), null, 2));
      break;
    case 'operations':
      console.log(JSON.stringify(query.queryOperations(), null, 2));
      break;
    case 'errors':
      console.log(JSON.stringify(query.queryErrors(), null, 2));
      break;
    case 'report':
      const taskId = args[1];
      console.log(JSON.stringify(query.generateReport(taskId), null, 2));
      break;
    default:
      console.log('Usage: log-query.js [sessions|operations|errors|report <task-id>]');
  }
}

module.exports = LogQuery;
```

### 步骤6: 添加到 .gitignore

```bash
# 添加日志目录到 .gitignore
echo "" >> .gitignore
echo "# Development logs" >> .gitignore
echo ".claude/logs/" >> .gitignore
```

### 步骤7: 创建使用文档

**文件**: `docs/logging-usage.md`

```markdown
# 开发日志使用指南

## 查询日志

### 查看所有会话
\`\`\`bash
node .claude/tools/log-query.js sessions
\`\`\`

### 查看特定任务的报告
\`\`\`bash
node .claude/tools/log-query.js report T001
\`\`\`

### 查看错误日志
\`\`\`bash
node .claude/tools/log-query.js errors
\`\`\`

## 手动记录决策

\`\`\`bash
node .claude/tools/logger.js log-decision \
  --number 1 \
  --title "选择 React 作为前端框架" \
  --content "$(cat decision.md)"
\`\`\`
```

---

## 🎯 下一步

1. ✅ 研究完成
2. ⏭️ 实现日志工具: `.claude/tools/logger.js`
3. ⏭️ 集成到 Agent 命令
4. ⏭️ 测试和验证
5. ⏭️ 编写使用文档

---

**研究完成日期**: 2025-10-02
**实现状态**: 待开始
**预计工作量**: 4-6 小时

