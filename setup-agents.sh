#!/bin/bash

# Claude Code Agent 系统一键安装脚本
# 基于 GPT-Pilot 工作流的通用开发代理框架

set -e  # 遇到错误立即退出

echo "🚀 Claude Code Agent 系统安装程序"
echo "===================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查依赖
echo "📦 检查依赖..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "⚠️  jq 未安装，建议安装以获得更好的体验"
    echo "   macOS: brew install jq"
    echo "   Linux: sudo apt-get install jq"
    echo ""
    read -p "是否继续安装? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ 依赖检查完成"
echo ""

# 创建目录结构
echo "📁 创建目录结构..."
mkdir -p .claude/{agents,templates,hooks,temp}
mkdir -p scripts
mkdir -p docs
echo "✅ 目录创建完成"
echo ""

# 创建 agents.json
echo "📝 创建 Agent 配置..."
cat > .claude/agents/agents.json << 'EOF'
{
  "agents": {
    "product-owner": {
      "name": "产品负责人",
      "emoji": "🎯",
      "description": "负责需求收集、分析和产品规格说明",
      "template": "product-owner.md",
      "inputs": ["project_description"],
      "outputs": ["docs/product_requirements.md", "CLAUDE.md"],
      "next_agent": "architect"
    },
    "architect": {
      "name": "软件架构师",
      "emoji": "🏗️",
      "description": "负责技术选型、架构设计和项目初始化",
      "template": "architect.md",
      "inputs": ["product_requirements"],
      "outputs": ["docs/architecture.md", "package.json"],
      "dependencies": ["product-owner"],
      "next_agent": "tech-lead"
    },
    "tech-lead": {
      "name": "技术主管",
      "emoji": "📋",
      "description": "负责任务分解、优先级排序和开发计划",
      "template": "tech-lead.md",
      "inputs": ["product_requirements", "architecture"],
      "outputs": ["tasks.md", "task_status.json"],
      "dependencies": ["architect"],
      "next_agent": "developer"
    },
    "developer": {
      "name": "开发工程师",
      "emoji": "💻",
      "description": "负责功能实现，使用TDD方式开发",
      "template": "developer.md",
      "inputs": ["task_id"],
      "outputs": ["code", "tests"],
      "dependencies": ["tech-lead"],
      "next_agent": "tester"
    },
    "tester": {
      "name": "测试工程师",
      "emoji": "🧪",
      "description": "负责编写测试用例和质量保证",
      "template": "tester.md",
      "inputs": ["task_id", "code"],
      "outputs": ["test_files", "test_report"],
      "dependencies": ["developer"],
      "next_agent": "reviewer"
    },
    "reviewer": {
      "name": "代码审查员",
      "emoji": "👀",
      "description": "负责代码审查和质量把关",
      "template": "reviewer.md",
      "inputs": ["task_id", "changed_files"],
      "outputs": ["review_report", "commit_message"],
      "dependencies": ["tester"],
      "next_agent": null
    },
    "debugger": {
      "name": "调试专家",
      "emoji": "🔧",
      "description": "负责问题诊断和Bug修复",
      "template": "debugger.md",
      "inputs": ["error_description", "error_logs"],
      "outputs": ["diagnosis", "fix"],
      "dependencies": [],
      "next_agent": null
    }
  },
  "workflow": {
    "default": ["product-owner", "architect", "tech-lead", "developer", "tester", "reviewer"],
    "hotfix": ["debugger", "tester", "reviewer"]
  }
}
EOF
echo "✅ Agent 配置创建完成"
echo ""

# 创建模板文件（简化版，包含核心模板）
echo "📄 创建 Agent 模板..."

# Product Owner Template (简化版)
cat > .claude/templates/product-owner.md << 'EOF'
# 🎯 产品负责人 Agent

你现在是产品负责人，负责需求收集和分析。

## 用户输入
项目描述：{{PROJECT_DESCRIPTION}}

## 任务

### 第一阶段：需求提问

提出 5-7 个关键问题澄清需求，关注：
- 目标用户和使用场景
- 核心功能和优先级  
- 技术平台偏好
- 数据存储需求
- 用户体验要求

### 第二阶段：生成文档

基于回答生成 `docs/product_requirements.md`，包括：
1. 项目概述
2. 功能需求（MVP vs 未来）
3. 非功能性需求
4. 用户流程图（Mermaid）
5. 数据模型
6. 技术约束
7. 里程碑规划

完成后更新 CLAUDE.md 和 .claude/context_memory.json

---
**下一步**: 运行 ./.claude/run-agent.sh /architect
EOF

# Architect Template (简化版)
cat > .claude/templates/architect.md << 'EOF'
# 🏗️ 软件架构师 Agent

你现在是软件架构师，负责技术设计。

## 输入
- 产品需求: {{PRODUCT_REQUIREMENTS}}

## 任务

### 阶段1：技术栈推荐

提供 2-3 个技术栈方案，包括：
- 前端框架和工具链
- 后端技术（如需要）
- 数据库方案
- 测试框架
- 开发工具

每个方案说明优劣势和适用场景。

### 阶段2：架构设计

选定技术栈后：
1. 绘制系统架构图（Mermaid）
2. 设计项目目录结构
3. 定义数据模型
4. 记录架构决策（ADR）

### 阶段3：项目初始化

1. 创建配置文件（package.json, tsconfig.json等）
2. 创建目录结构
3. 安装依赖
4. 创建基础文件
5. 配置开发脚本

### 阶段4：生成文档

创建 `docs/architecture.md` 包括：
- 技术栈详情
- 系统架构
- 目录结构
- 开发规范
- 部署架构
- ADR记录

更新 CLAUDE.md 添加技术信息。

---
**下一步**: 运行 ./.claude/run-agent.sh /tech-lead
EOF

# Tech Lead Template (简化版)
cat > .claude/templates/tech-lead.md << 'EOF'
# 📋 技术主管 Agent

你现在是技术主管，负责任务分解。

## 输入
- 产品需求: {{PRODUCT_REQUIREMENTS}}
- 系统架构: {{ARCHITECTURE}}

## 任务分解原则

1. 粒度：2-4小时/任务
2. 依赖清晰
3. 可测试
4. 独立性高
5. 优先级明确

## 任务类别

- 🏗️ 基础设施：配置、工具
- 🎨 UI组件：界面组件
- ⚙️ 核心功能：业务逻辑
- 💾 数据层：状态、存储
- 🧪 测试：各类测试
- 📖 文档：文档编写

## 执行步骤

1. 分析需求和架构，识别所有功能点
2. 为每个功能创建任务（使用标准JSON格式）
3. 建立依赖关系
4. 估算时间和排序

## 输出

生成两个文件：
- `task_status.json` - 机器可读的任务数据
- `tasks.md` - 人类可读的任务列表

包括任务统计、里程碑、依赖图（Mermaid）。

---
**下一步**: 运行 node scripts/task.js next 查看首个任务
EOF

# Developer Template
cat > .claude/templates/developer.md << 'EOF'
# 💻 开发工程师 Agent

你现在是开发工程师，使用TDD方式实现功能。

## 输入
任务ID: {{TASK_ID}}

## TDD工作流

### 阶段1：规划（不编码）
1. 阅读任务需求和验收标准
2. 列出涉及文件
3. 设计模块接口
4. 生成实现计划（5-8步）

### 阶段2：测试先行
1. 根据验收标准编写测试
2. 测试应具体可执行
3. 标注"现在会失败"
4. 不创建mock实现
5. 运行测试确认失败

### 阶段3：最小实现
1. 实现最少代码让测试通过
2. 每写一部分就运行测试
3. 保持代码简洁

### 阶段4：重构优化
1. 改进代码结构
2. 添加注释
3. 确保测试仍通过
4. 检查ESLint

### 阶段5：验收检查
1. 运行所有测试
2. 检查覆盖率
3. 验证所有验收标准
4. 生成提交信息

每阶段完成等待确认再继续。
如果卡住超过5分钟，暂停请求帮助。

---
**下一步**: 测试通过后运行 ./.claude/run-agent.sh /reviewer {{TASK_ID}}
EOF

# Reviewer Template
cat > .claude/templates/reviewer.md << 'EOF'
# 👀 代码审查员 Agent

你现在是代码审查员，负责质量把关。

## 输入
任务ID: {{TASK_ID}}

## 审查要点

### 1. 功能正确性
- 满足所有验收标准
- 边界情况处理
- 错误处理完善

### 2. 代码质量
- 可读性和可维护性
- 遵循项目规范
- 无重复代码
- 命名清晰

### 3. 测试覆盖
- 所有测试通过
- 覆盖率足够（>80%）
- 测试有意义

### 4. 架构一致性
- 符合系统架构
- 正确使用设计模式
- 模块边界清晰

## 输出格式

```
## 审查结果：[PASS/REVISE]

## 问题清单
1. [问题] - 严重程度：[高/中/低]
   建议：[如何修改]

## 提交信息（如通过）
type(scope): subject

- 详细改动1
- 详细改动2

Closes #{{TASK_ID}}
```

审查通过后执行 git commit。

---
**下一步**: 运行 node scripts/task.js update {{TASK_ID}} completed
EOF

# Debugger Template
cat > .claude/templates/debugger.md << 'EOF'
# 🔧 调试专家 Agent

你现在是调试专家，负责问题诊断。

## 输入
错误描述: {{ERROR_DESCRIPTION}}
错误日志: {{ERROR_LOGS}}

## 递归调试策略

### 第1层：现象分析
- 准确描述错误现象
- 重现步骤
- 预期vs实际行为

### 第2层：根因定位
- 检查相关代码
- 添加日志/断点
- 验证假设

### 第3层：尝试修复
- 实施修复方案
- 运行测试验证
- 失败则回到第2层

### 第4层：深度诊断
- 检查依赖和环境
- 查看堆栈跟踪
- 搜索类似问题

### 第5层：人工介入
- 达到5层则暂停
- 总结已尝试方案
- 请求开发者介入

最大递归深度：5层
每层时间限制：10分钟

---
**修复后**: 运行测试验证，然后提交修复
EOF

# Tester Template
cat > .claude/templates/tester.md << 'EOF'
# 🧪 测试工程师 Agent

你现在是测试工程师，负责测试编写。

## 输入
任务ID: {{TASK_ID}}
代码: {{CODE}}

## 测试类型

### 1. 单元测试
- 测试独立函数/方法
- 覆盖正常和异常情况
- 边界条件测试

### 2. 集成测试
- 测试模块间交互
- 验证数据流
- 测试API调用

### 3. E2E测试（如适用）
- 测试完整用户流程
- 真实环境模拟

## 测试编写原则

- 测试意图清晰
- 独立可运行
- 快速执行
- 易于维护
- 使用 describe/it 结构

## 输出

为任务创建完整测试套件：
- tests/unit/[name].test.ts
- tests/integration/[name].test.ts
- 测试报告

确保测试覆盖率 > 80%

---
**下一步**: 所有测试通过后运行 ./.claude/run-agent.sh /reviewer {{TASK_ID}}
EOF

echo "✅ Agent 模板创建完成"
echo ""

# 创建命令处理器
echo "⚙️  创建命令处理器..."
cat > .claude/hooks/command-handler.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const agentsConfig = JSON.parse(fs.readFileSync('.claude/agents/agents.json', 'utf8'));

function loadTemplate(templateName) {
  return fs.readFileSync(`.claude/templates/${templateName}`, 'utf8');
}

function renderTemplate(template, variables) {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, value);
  }
  return rendered;
}

function loadContext() {
  const context = { DATE: new Date().toISOString().split('T')[0] };
  
  try { context.PRODUCT_REQUIREMENTS = fs.readFileSync('docs/product_requirements.md', 'utf8'); }
  catch (e) { context.PRODUCT_REQUIREMENTS = '尚未生成'; }
  
  try { context.ARCHITECTURE = fs.readFileSync('docs/architecture.md', 'utf8'); }
  catch (e) { context.ARCHITECTURE = '尚未生成'; }
  
  try { context.PROJECT_NAME = JSON.parse(fs.readFileSync('package.json', 'utf8')).name; }
  catch (e) { context.PROJECT_NAME = path.basename(process.cwd()); }
  
  return context;
}

function handleAgentCommand(agentName, userInput, taskId) {
  const agent = agentsConfig.agents[agentName];
  
  if (!agent) {
    console.error(`❌ Agent '${agentName}' 不存在`);
    console.log('\n可用的 Agents:');
    Object.keys(agentsConfig.agents).forEach(name => {
      const a = agentsConfig.agents[name];
      console.log(`  /${name.padEnd(15)} - ${a.emoji} ${a.description}`);
    });
    process.exit(1);
  }
  
  const template = loadTemplate(agent.template);
  const context = loadContext();
  const variables = {
    ...context,
    PROJECT_DESCRIPTION: userInput || '',
    TASK_ID: taskId || '',
    ERROR_DESCRIPTION: userInput || '',
    ERROR_LOGS: '',
    CODE: ''
  };
  
  const prompt = renderTemplate(template, variables);
  
  console.log('\n' + '='.repeat(80));
  console.log(`${agent.emoji} ${agent.name} Agent 已激活`);
  console.log('='.repeat(80) + '\n');
  console.log(prompt);
  console.log('\n' + '='.repeat(80));
  
  fs.mkdirSync('.claude/temp', { recursive: true });
  fs.writeFileSync('.claude/temp/current_prompt.md', prompt);
  
  try {
    const memory = JSON.parse(fs.readFileSync('.claude/context_memory.json', 'utf8'));
    memory.last_agent = agentName;
    memory.last_updated = new Date().toISOString();
    fs.writeFileSync('.claude/context_memory.json', JSON.stringify(memory, null, 2));
  } catch (e) {}
  
  console.log('\n💡 提示：');
  console.log('  1. 复制以上内容');
  console.log('  2. 粘贴到 Claude Code');
  console.log('  3. 或运行: claude < .claude/temp/current_prompt.md');
  
  if (agent.next_agent) {
    console.log(`\n📍 完成后运行: ./.claude/run-agent.sh /${agent.next_agent}`);
  }
}

const [,, command, ...args] = process.argv;

if (!command) {
  console.log('用法: node .claude/hooks/command-handler.js <agent> [输入] [任务ID]');
  console.log('\n可用 Agents:');
  Object.entries(agentsConfig.agents).forEach(([name, agent]) => {
    console.log(`  ${name.padEnd(15)} - ${agent.emoji} ${agent.description}`);
  });
  process.exit(0);
}

const agentName = command.replace(/^\//, '');
const userInput = args.slice(0, -1).join(' ') || args.join(' ');
const taskId = args.length > 0 && args[args.length - 1].startsWith('T') ? args[args.length - 1] : '';

handleAgentCommand(agentName, userInput, taskId);
EOF

chmod +x .claude/hooks/command-handler.js
echo "✅ 命令处理器创建完成"
echo ""

# 创建运行脚本
echo "🎬 创建运行脚本..."
cat > .claude/run-agent.sh << 'EOF'
#!/bin/bash

AGENT_NAME=$1
shift
USER_INPUT="$@"

if [ -z "$AGENT_NAME" ]; then
    echo "❌ 请指定 Agent"
    echo ""
    echo "用法: ./.claude/run-agent.sh /agent-name [\"用户输入\"] [任务ID]"
    echo ""
    echo "示例:"
    echo "  ./.claude/run-agent.sh /product-owner \"我想做番茄时钟\""
    echo "  ./.claude/run-agent.sh /architect"
    echo "  ./.claude/run-agent.sh /developer T001"
    echo ""
    node .claude/hooks/command-handler.js
    exit 1
fi

node .claude/hooks/command-handler.js "$AGENT_NAME" "$USER_INPUT"

if command -v pbcopy &> /dev/null; then
    cat .claude/temp/current_prompt.md | pbcopy
    echo "✅ 提示词已复制到剪贴板"
fi
EOF

chmod +x .claude/run-agent.sh
echo "✅ 运行脚本创建完成"
echo ""

# 创建任务管理脚本
echo "📊 创建任务管理脚本..."
cat > scripts/task.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');

function loadStatus() {
  try {
    return JSON.parse(fs.readFileSync('task_status.json', 'utf8'));
  } catch (e) {
    console.error('❌ task_status.json 不存在，请先运行 /tech-lead');
    process.exit(1);
  }
}

function saveStatus(status) {
  fs.writeFileSync('task_status.json', JSON.stringify(status, null, 2));
}

function getNextTask() {
  const status = loadStatus();
  const pending = status.tasks.filter(t => t.status === 'pending');
  
  const ready = pending.filter(task => {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every(depId => {
      const dep = status.tasks.find(t => t.id === depId);
      return dep && dep.status === 'completed';
    });
  });

  if (ready.length > 0) {
    const priorities = { '高': 0, '中': 1, '低': 2 };
    const next = ready.sort((a, b) => priorities[a.priority] - priorities[b.priority])[0];
    
    console.log(`\n📋 下一个任务: ${next.id}`);
    console.log(`📝 ${next.title}`);
    console.log(`⏱️  预计: ${next.estimated_hours}小时`);
    console.log(`🎯 优先级: ${next.priority}`);
    console.log(`\n${next.description}`);
    console.log(`\n验收标准:`);
    next.acceptance_criteria.forEach((c, i) => console.log(`  ${i+1}. ${c}`));
    console.log(`\n💡 开始任务: ./.claude/run-agent.sh /developer ${next.id}`);
    return next;
  } else {
    console.log('\n✅ 所有任务已完成或无可执行任务');
    return null;
  }
}

function updateTask(taskId, newStatus) {
  const status = loadStatus();
  const task = status.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    task.updated_at = new Date().toISOString();
    if (newStatus === 'completed') task.completed_at = new Date().toISOString();
    saveStatus(status);
    console.log(`✅ 任务 ${taskId} → ${newStatus}`);
  } else {
    console.error(`❌ 未找到任务: ${taskId}`);
  }
}

function listTasks(filter) {
  const status = loadStatus();
  let tasks = filter ? status.tasks.filter(t => t.status === filter) : status.tasks;
  
  const stats = {
    pending: status.tasks.filter(t => t.status === 'pending').length,
    'in-progress': status.tasks.filter(t => t.status === 'in-progress').length,
    testing: status.tasks.filter(t => t.status === 'testing').length,
    completed: status.tasks.filter(t => t.status === 'completed').length
  };
  
  console.log(`\n📊 任务统计:`);
  console.log(`  ⏳ 待办: ${stats.pending} | 🔄 进行中: ${stats['in-progress']}`);
  console.log(`  🧪 测试中: ${stats.testing} | ✅ 完成: ${stats.completed}`);
  console.log(`\n任务列表:`);
  
  const icons = { pending: '⏳', 'in-progress': '🔄', testing: '🧪', completed: '✅' };
  tasks.forEach(t => {
    console.log(`  ${icons[t.status] || '❓'} ${t.id}: ${t.title}`);
  });
}

const [,, command, ...args] = process.argv;

switch (command) {
  case 'next': getNextTask(); break;
  case 'update': updateTask(args[0], args[1]); break;
  case 'list': listTasks(args[0]); break;
  default:
    console.log('用法:');
    console.log('  node scripts/task.js next              - 获取下一个任务');
    console.log('  node scripts/task.js update <ID> <状态> - 更新任务');
    console.log('  node scripts/task.js list [状态]        - 列出任务');
}
EOF

chmod +x scripts/task.js
echo "✅ 任务管理脚本创建完成"
echo ""

# 创建上下文记忆文件
echo "💾 创建上下文文件..."
cat > .claude/context_memory.json << 'EOF'
{
  "project_name": "",
  "last_agent": null,
  "last_updated": "",
  "workflow_stage": "initialization",
  "completed_stages": [],
  "important_decisions": [],
  "pending_issues": [],
  "custom_vars": {}
}
EOF
echo "✅ 上下文文件创建完成"
echo ""

# 创建快速开始文档
echo "📚 创建使用文档..."
cat > .claude/README.md << 'EOF'
# Claude Code Agent 系统

基于 GPT-Pilot 工作流的通用开发代理框架

## 快速开始

### 1. 需求收集
```bash
./.claude/run-agent.sh /product-owner "我想做一个番茄时钟应用"
```

### 2. 架构设计
```bash
./.claude/run-agent.sh /architect
```

### 3. 任务分解
```bash
./.claude/run-agent.sh /tech-lead
```

### 4. 开始开发
```bash
node scripts/task.js next
./.claude/run-agent.sh /developer T001
```

### 5. 代码审查
```bash
./.claude/run-agent.sh /reviewer T001
```

## 可用 Agents

- `/product-owner` - 🎯 需求收集和分析
- `/architect` - 🏗️ 技术选型和架构设计  
- `/tech-lead` - 📋 任务分解和计划
- `/developer` - 💻 功能实现（TDD）
- `/tester` - 🧪 测试编写
- `/reviewer` - 👀 代码审查
- `/debugger` - 🔧 问题诊断

## 任务管理

```bash
# 获取下一个任务
node scripts/task.js next

# 更新任务状态
node scripts/task.js update T001 in-progress
node scripts/task.js update T001 completed

# 列出所有任务
node scripts/task.js list

# 列出待办任务
node scripts/task.js list pending
```

## 工作流

```
需求收集 → 架构设计 → 任务分解 → 迭代开发 → 测试 → 审查 → 完成
```

## 提示

- 每次运行 Agent 都会生成完整的提示词
- 提示词自动复制到剪贴板（macOS）
- 可以直接粘贴到 Claude Code 使用
- 所有状态保存在 .claude/ 目录

## 文档

- 完整文档: claude-code-agents-system.md
- 教程: pomodoro-app-tutorial.md
EOF
echo "✅ 使用文档创建完成"
echo ""

# 创建 .gitignore
if [ ! -f .gitignore ]; then
    echo "📝 创建 .gitignore..."
    cat > .gitignore << 'EOF'
node_modules/
.claude/temp/
*.log
.DS_Store
EOF
    echo "✅ .gitignore 创建完成"
    echo ""
fi

# 完成提示
echo ""
echo "${GREEN}✨ 安装完成！${NC}"
echo "=================================="
echo ""
echo "${BLUE}📖 目录结构:${NC}"
echo "  .claude/"
echo "  ├── agents/         - Agent 配置"
echo "  ├── templates/      - 提示词模板"
echo "  ├── hooks/          - 命令处理器"
echo "  ├── temp/           - 临时文件"
echo "  └── README.md       - 使用文档"
echo ""
echo "${BLUE}🚀 快速开始:${NC}"
echo ""
echo "  ${YELLOW}1. 启动需求收集${NC}"
echo "     ./.claude/run-agent.sh /product-owner \"你的项目描述\""
echo ""
echo "  ${YELLOW}2. 架构设计${NC}"
echo "     ./.claude/run-agent.sh /architect"
echo ""
echo "  ${YELLOW}3. 任务分解${NC}"
echo "     ./.claude/run-agent.sh /tech-lead"
echo ""
echo "  ${YELLOW}4. 开始开发${NC}"
echo "     node scripts/task.js next"
echo "     ./.claude/run-agent.sh /developer T001"
echo ""
echo "${BLUE}📚 查看文档:${NC}"
echo "  cat .claude/README.md"
echo ""
echo "${BLUE}💡 提示:${NC}"
echo "  - 每次运行 Agent 会自动生成提示词"
echo "  - 提示词会复制到剪贴板（macOS）"
echo "  - 直接粘贴到 Claude Code 使用"
echo ""
echo "${GREEN}Happy Coding! 🎉${NC}"
echo ""
