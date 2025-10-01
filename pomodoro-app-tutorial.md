# 番茄时钟应用开发实战教程
## 使用 Claude Code 2.0 + GPT-Pilot 工作流

---

## 目录
1. [准备工作](#准备工作)
2. [阶段1：项目初始化](#阶段1项目初始化)
3. [阶段2：需求收集](#阶段2需求收集)
4. [阶段3：架构设计](#阶段3架构设计)
5. [阶段4：任务分解](#阶段4任务分解)
6. [阶段5：迭代开发](#阶段5迭代开发)
7. [阶段6：测试与部署](#阶段6测试与部署)
8. [完整命令速查](#完整命令速查)

---

## 准备工作

### 安装 Claude Code
```bash
# 安装 Claude Code
npm install -g @anthropic-ai/claude-code

# 验证安装
claude --version
```

### 创建项目目录
```bash
# 创建项目根目录
mkdir pomodoro-timer
cd pomodoro-timer

# 初始化 git
git init
```

---

## 阶段1：项目初始化

### 步骤 1.1：创建基础文件结构

**复制并运行以下脚本**：

```bash
# 创建 init-project.sh
cat > init-project.sh << 'EOF'
#!/bin/bash

echo "🚀 初始化番茄时钟项目..."

# 创建目录结构
mkdir -p {src,tests,docs,scripts,hooks,.claude}
mkdir -p src/{components,utils,styles}
mkdir -p tests/{unit,integration}

# 创建 CLAUDE.md
cat > CLAUDE.md << 'CLAUDE_EOF'
# 番茄时钟应用

## 项目概述
一个简洁高效的番茄工作法计时器应用，帮助用户提高专注力和工作效率。

## 技术栈
将在架构设计阶段确定

## 开发规范
将在架构设计阶段确定

## 项目状态
- 当前阶段：初始化
- 最后更新：$(date +%Y-%m-%d)
CLAUDE_EOF

# 创建任务追踪文件
cat > tasks.md << 'TASKS_EOF'
# 番茄时钟 - 任务列表

## 📋 待分解
任务将在 Tech Lead 阶段生成

## ⏳ 进行中

## ✅ 已完成
- [x] 项目初始化
TASKS_EOF

# 创建任务状态 JSON
cat > task_status.json << 'JSON_EOF'
{
  "project": "Pomodoro Timer",
  "created_at": "$(date -Iseconds)",
  "current_phase": "initialization",
  "tasks": []
}
JSON_EOF

# 创建上下文记忆文件
cat > .claude/context_memory.json << 'CONTEXT_EOF'
{
  "project_name": "Pomodoro Timer",
  "last_updated": "$(date -Iseconds)",
  "important_decisions": [],
  "pending_issues": [],
  "key_insights": []
}
CONTEXT_EOF

# 创建 .gitignore
cat > .gitignore << 'GITIGNORE_EOF'
node_modules/
dist/
build/
.env
.DS_Store
*.log
.claude/temp/
GITIGNORE_EOF

echo "✅ 项目结构创建完成！"
echo ""
echo "📁 目录结构："
tree -L 2 -I 'node_modules'

echo ""
echo "🎯 下一步："
echo "1. 运行: chmod +x init-project.sh && ./init-project.sh"
echo "2. 运行: claude"
echo "3. 开始需求收集阶段"
EOF

# 运行初始化脚本
chmod +x init-project.sh
./init-project.sh
```

**你应该看到**：
```
✅ 项目结构创建完成！

📁 目录结构：
pomodoro-timer/
├── CLAUDE.md
├── tasks.md
├── task_status.json
├── src/
├── tests/
├── docs/
└── .claude/
```

---

## 阶段2：需求收集

### 步骤 2.1：启动 Claude Code

```bash
# 在项目根目录运行
claude
```

**第一次运行会提示登录**，按照提示完成认证。

### 步骤 2.2：进行需求对话

**复制以下提示词并粘贴到 Claude Code**：

```
🎯 角色：产品负责人 (Product Owner)

我想构建一个番茄时钟应用。请帮我明确需求。

应用描述：
一个基于番茄工作法的计时器应用，帮助用户通过25分钟专注工作和5分钟休息的循环来提高效率。

请按以下步骤进行：

1. **分析并提问**
   - 仔细分析我的描述
   - 识别不清楚或需要澄清的地方
   - 提出 5-7 个关键问题

2. **关注领域**
   提问时请关注：
   - 目标用户和使用场景
   - 核心功能和优先级
   - 计时器的行为细节（暂停、跳过等）
   - 数据存储需求（历史记录、统计）
   - 用户界面偏好（桌面/Web/移动）
   - 通知和提醒方式
   - 可定制性（时间长度、主题等）

3. **输出要求**
   等我回答完所有问题后：
   - 总结核心功能列表（按优先级排序）
   - 识别 MVP 功能和未来功能
   - 创建详细的 product_requirements.md 文件
   - 更新 CLAUDE.md 文件

现在，请开始提问！一次提出所有问题，我会一起回答。
```

### 步骤 2.3：回答问题

**Claude 会问类似这些问题，这里是建议回答**：

```
Claude 的问题示例：
1. 这个应用主要面向哪类用户？学生、职场人士还是通用？
2. 番茄钟的时长是否可以自定义？还是固定25分钟工作+5分钟休息？
3. 是否需要记录历史数据？如果需要，保存哪些信息？
4. 是否需要统计功能（如每日完成的番茄钟数量）？
5. 应用类型偏好：Web应用、桌面应用还是移动应用？
6. 是否需要声音/通知提醒？
7. 是否需要任务管理功能（番茄钟绑定到具体任务）？

你的回答（复制这个）：
---
1. **目标用户**：通用用户，主要是需要提高专注力的职场人士和学生

2. **时长设置**：
   - 默认：25分钟工作 + 5分钟短休息 + 15分钟长休息（每4个番茄钟）
   - 可自定义：用户可以调整每个阶段的时长

3. **历史记录**：
   - 需要保存每个完成的番茄钟
   - 记录信息：开始时间、结束时间、是否完整完成、关联的任务名称

4. **统计功能**：
   - 需要基础统计：今日/本周/本月完成的番茄钟数量
   - 简单的可视化图表

5. **应用类型**：Web应用（响应式设计，可以在桌面和移动端使用）

6. **提醒方式**：
   - 浏览器通知（需要用户授权）
   - 可选的提示音
   - 视觉提醒（页面标题闪烁、颜色变化）

7. **任务管理**：
   - 简单的任务列表功能
   - 可以为每个番茄钟关联一个任务
   - 任务可以标记为完成

8. **其他需求**：
   - 简洁美观的界面
   - 深色/浅色主题切换
   - 数据本地存储（localStorage）
   - 无需注册登录（本地应用）
---
```

### 步骤 2.4：生成需求文档

**Claude 会自动创建 product_requirements.md**。检查文件：

```bash
# 查看生成的需求文档
cat docs/product_requirements.md
```

**如果没有自动创建，使用以下提示词**：

```
基于我的回答，请创建详细的 product_requirements.md 文件。

文件结构应包括：
1. 项目概述
2. 目标用户
3. 核心功能（MVP）
4. 未来功能（V2）
5. 技术需求
6. 非功能性需求（性能、可用性等）
7. 用户流程图（使用 Mermaid）

将文件保存到 docs/product_requirements.md
```

---

## 阶段3：架构设计

### 步骤 3.1：架构师角色切换

**在 Claude Code 中输入**：

```
🎯 角色切换：软件架构师 (Software Architect)

基于 docs/product_requirements.md 中的需求，请设计系统架构。

任务清单：

1. **技术栈推荐**
   - 前端框架：考虑 React/Vue/Vanilla JS
   - 状态管理：如果需要
   - 样式方案：CSS/Tailwind/Styled Components
   - 构建工具：Vite/Webpack
   - 测试框架：Jest/Vitest
   推荐标准：适合单页应用、学习曲线、社区支持

2. **系统架构设计**
   - 整体架构图（Mermaid）
   - 数据流设计
   - 状态管理策略
   - 本地存储方案

3. **项目结构设计**
   - 详细的目录结构
   - 文件命名规范
   - 模块划分原则

4. **开发环境配置**
   - 列出所有依赖包
   - 开发工具配置（ESLint、Prettier）
   - npm scripts 定义

5. **输出要求**
   - 创建 docs/architecture.md 文档
   - 更新 CLAUDE.md（添加技术栈和规范）
   - 创建完整的 package.json
   - 初始化项目（安装依赖）

请先提供技术栈推荐方案（2-3个选项），等我选择后再继续。
```

### 步骤 3.2：选择技术栈

**Claude 会提供几个技术栈方案，这里是建议选择**：

```
我选择方案：

【推荐配置】
- 前端框架：React 18 + TypeScript
- 构建工具：Vite
- 样式方案：Tailwind CSS
- 状态管理：React Context + useReducer（轻量级）
- 路由：React Router（如果需要多页面）
- 音频：Web Audio API
- 通知：Notification API
- 存储：localStorage + 自定义 hooks
- 测试：Vitest + React Testing Library
- 代码质量：ESLint + Prettier

理由：
- TypeScript 提供类型安全
- Vite 构建快速，开发体验好
- Tailwind CSS 快速开发 UI
- 无需重量级状态管理库
- 现代化、社区活跃

请基于这个技术栈继续架构设计。
```

### 步骤 3.3：完成架构设计

**Claude 会执行以下操作**：
1. 创建 package.json
2. 安装依赖
3. 创建目录结构
4. 生成配置文件（tsconfig.json, vite.config.ts, tailwind.config.js 等）
5. 创建 docs/architecture.md

**验证结果**：

```bash
# 检查依赖是否安装
ls node_modules/ | head

# 查看项目结构
tree -L 3 -I 'node_modules'

# 查看架构文档
cat docs/architecture.md
```

---

## 阶段4：任务分解

### 步骤 4.1：技术主管角色

**在 Claude Code 中输入**：

```
🎯 角色切换：技术主管 (Tech Lead)

现在需要将项目分解为具体的开发任务。

输入文档：
- docs/product_requirements.md（功能需求）
- docs/architecture.md（技术架构）

任务分解原则：
1. **任务粒度**：每个任务 2-4 小时完成
2. **依赖清晰**：明确任务间的依赖关系
3. **可测试**：每个任务都有明确的验收标准
4. **独立性**：尽量减少任务间的耦合

任务分类：
- 🏗️ 基础设施（项目配置、工具设置）
- 🎨 UI 组件（可复用组件）
- ⚙️ 核心功能（业务逻辑）
- 💾 数据层（状态管理、存储）
- 🧪 测试（单元测试、集成测试）
- 📖 文档（代码注释、使用说明）

每个任务包含：
```json
{
  "id": "T001",
  "title": "任务标题",
  "category": "基础设施|UI组件|核心功能|数据层|测试|文档",
  "priority": "高|中|低",
  "estimated_hours": 2,
  "dependencies": ["T000"],
  "description": "详细描述要做什么",
  "acceptance_criteria": [
    "验收标准1",
    "验收标准2"
  ],
  "files_to_create": [
    "src/components/Timer.tsx"
  ],
  "files_to_modify": [
    "src/App.tsx"
  ],
  "test_requirements": "需要编写的测试"
}
```

输出要求：
1. 生成完整的任务列表（JSON格式）保存到 task_status.json
2. 生成可读的任务列表保存到 tasks.md
3. 按依赖关系排序任务
4. 标记 MVP 任务（最小可行产品必需）

请开始任务分解。
```

### 步骤 4.2：审查任务列表

**Claude 会生成任务列表，你需要审查**：

```bash
# 查看任务概览
cat tasks.md

# 查看详细任务数据
cat task_status.json | jq '.tasks[] | {id, title, priority, dependencies}'
```

**如果需要调整，告诉 Claude**：

```
任务列表看起来不错，但我想调整：

1. 将 [任务ID] 的优先级提高到"高"
2. [任务ID] 应该依赖 [任务ID]
3. 添加一个新任务：[描述]

请更新 tasks.md 和 task_status.json。
```

---

## 阶段5：迭代开发

### 步骤 5.1：创建开发辅助脚本

**创建任务管理脚本**：

```bash
# 创建 scripts/task.js
cat > scripts/task.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');

const statusFile = 'task_status.json';

function loadStatus() {
  return JSON.parse(fs.readFileSync(statusFile, 'utf8'));
}

function saveStatus(status) {
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
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
    const next = ready.sort((a, b) => {
      const priorityOrder = { '高': 0, '中': 1, '低': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })[0];

    console.log(`\n📋 下一个任务: ${next.id}`);
    console.log(`📝 标题: ${next.title}`);
    console.log(`⏱️  预计: ${next.estimated_hours}小时`);
    console.log(`🎯 优先级: ${next.priority}`);
    console.log(`\n描述:\n${next.description}`);
    console.log(`\n验收标准:`);
    next.acceptance_criteria.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c}`);
    });
    return next;
  } else {
    console.log('\n✅ 所有任务已完成或无可执行任务！');
    return null;
  }
}

function updateTask(taskId, status) {
  const data = loadStatus();
  const task = data.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    task.updated_at = new Date().toISOString();
    saveStatus(data);
    console.log(`✅ 任务 ${taskId} 状态更新为: ${status}`);
  } else {
    console.error(`❌ 未找到任务: ${taskId}`);
  }
}

function listTasks(filter) {
  const status = loadStatus();
  let tasks = status.tasks;
  
  if (filter) {
    tasks = tasks.filter(t => t.status === filter);
  }

  console.log(`\n📊 任务统计:`);
  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    testing: tasks.filter(t => t.status === 'testing').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };
  console.log(`  待办: ${stats.pending} | 进行中: ${stats['in-progress']} | 测试中: ${stats.testing} | 完成: ${stats.completed}`);
  
  console.log(`\n任务列表:`);
  tasks.forEach(t => {
    const icon = {
      pending: '⏳',
      'in-progress': '🔄',
      testing: '🧪',
      completed: '✅'
    }[t.status] || '❓';
    console.log(`  ${icon} ${t.id}: ${t.title} [${t.status}]`);
  });
}

const [,, command, ...args] = process.argv;

switch (command) {
  case 'next':
    getNextTask();
    break;
  case 'update':
    updateTask(args[0], args[1]);
    break;
  case 'list':
    listTasks(args[0]);
    break;
  default:
    console.log(`
用法:
  node scripts/task.js next              - 获取下一个待办任务
  node scripts/task.js update <ID> <状态> - 更新任务状态
  node scripts/task.js list [状态]        - 列出任务

状态: pending | in-progress | testing | completed
    `);
}
EOF

chmod +x scripts/task.js
```

### 步骤 5.2：开始第一个任务

**获取第一个任务**：

```bash
node scripts/task.js next
```

**应该显示类似**：

```
📋 下一个任务: T001
📝 标题: 项目基础配置
⏱️  预计: 2小时
🎯 优先级: 高

描述:
设置项目的基础配置文件、开发环境和代码规范工具...
```

### 步骤 5.3：使用 TDD 方式实现任务

**在 Claude Code 中输入**：

```
🎯 开始任务: T001

我将使用测试驱动开发（TDD）方式实现这个任务。

任务详情：
[从上面的输出复制任务详情]

TDD 工作流程：

【阶段 1 - 规划】不要编写任何代码
1. 阅读任务需求和验收标准
2. 列出需要创建/修改的文件
3. 设计模块接口和函数签名
4. 生成实现计划（5-8个步骤）

【阶段 2 - 测试先行】
1. 根据验收标准编写测试用例
2. 测试应该具体、可执行
3. 明确标注"这些测试现在会失败"
4. 不要创建任何 mock 实现
5. 运行测试确认失败

【阶段 3 - 最小实现】
1. 实现最少的代码让测试通过
2. 每写一小部分就运行测试
3. 保持代码简洁

【阶段 4 - 重构优化】
1. 改进代码结构
2. 添加注释
3. 确保测试仍然通过
4. 检查代码规范（ESLint）

【阶段 5 - 验收检查】
1. 运行所有测试
2. 检查测试覆盖率
3. 验证所有验收标准
4. 生成提交信息

重要规则：
- 每个阶段完成后等我确认再继续
- 如果卡住超过 5 分钟，暂停并请求帮助
- 所有改动都要有对应的测试

请从【阶段 1 - 规划】开始。
```

### 步骤 5.4：执行 TDD 循环

**阶段 1 完成后**，Claude 会提供实现计划，你审查后：

```
计划看起来很好！请继续【阶段 2 - 测试先行】。
```

**阶段 2 完成后**，验证测试：

```bash
# 运行测试（应该失败）
npm test
```

然后告诉 Claude：

```
测试已创建并确认失败。请继续【阶段 3 - 最小实现】。
```

**阶段 3-4**，让 Claude 逐步实现并重构。

**阶段 5**，验收完成：

```
所有测试通过！请生成提交信息并执行 git commit。
```

### 步骤 5.5：提交并更新状态

**Claude 会提交代码后**：

```bash
# 更新任务状态
node scripts/task.js update T001 completed

# 查看进度
node scripts/task.js list

# 获取下一个任务
node scripts/task.js next
```

### 步骤 5.6：并行开发（可选 - 适合独立任务）

**如果有多个独立任务，可以并行开发**：

```bash
# 创建 worktrees
git worktree add ../pomodoro-timer-ui feature/ui-components
git worktree add ../pomodoro-timer-logic feature/core-logic

# 在新终端窗口中
cd ../pomodoro-timer-ui
claude

# 在另一个终端窗口中
cd ../pomodoro-timer-logic
claude
```

**在每个 Claude 实例中**：

```
我在并行开发环境中工作，负责 [UI组件/核心逻辑]。

环境信息：
- Worktree: [路径]
- 分支: feature/[功能名]
- 基准分支: main

协作规则：
1. 只修改与我负责功能相关的文件
2. 避免修改共享配置文件
3. 完成后通知并等待合并

任务: [复制任务详情]

请按 TDD 流程开始实现。
```

---

## 阶段6：测试与部署

### 步骤 6.1：集成测试

**所有功能任务完成后**：

```
🎯 角色：质量保证工程师

所有开发任务已完成，现在需要进行全面的集成测试。

测试清单：

1. **功能测试**
   - 运行所有单元测试: npm test
   - 检查测试覆盖率: npm run test:coverage
   - 目标：覆盖率 > 80%

2. **端到端测试**
   - 测试完整的用户流程
   - 各个功能模块的集成
   - 边界情况处理

3. **浏览器兼容性**
   - Chrome（最新版本）
   - Firefox（最新版本）
   - Safari（最新版本）
   - 移动端浏览器

4. **性能测试**
   - 页面加载时间 < 2秒
   - 计时器精度误差 < 100ms
   - 内存占用合理

5. **用户体验测试**
   - 界面响应速度
   - 视觉一致性
   - 错误提示清晰

请执行以上测试，发现问题请记录并修复。
```

### 步骤 6.2：代码审查

```
🎯 进行最终代码审查

审查要点：

1. **代码质量**
   - 运行 ESLint: npm run lint
   - 检查未使用的导入和变量
   - 确保代码符合规范

2. **架构一致性**
   - 组件结构是否符合设计
   - 状态管理是否合理
   - 文件组织是否清晰

3. **文档完整性**
   - README.md 是否完善
   - 关键函数是否有注释
   - API 文档是否清晰

4. **安全检查**
   - 运行安全审计: npm audit
   - 检查依赖漏洞
   - 修复高危问题

请执行审查并生成报告。
```

### 步骤 6.3：准备部署

**创建 README.md**：

```
请创建完整的 README.md 文件，包括：

1. **项目介绍**
   - 番茄时钟应用简介
   - 主要功能截图

2. **快速开始**
   - 环境要求
   - 安装步骤
   - 运行命令

3. **功能说明**
   - 各个功能的使用方法
   - 快捷键说明

4. **技术栈**
   - 使用的技术和工具

5. **项目结构**
   - 目录说明

6. **开发指南**
   - 如何贡献代码
   - 开发规范

7. **构建和部署**
   - 构建命令
   - 部署到 Vercel/Netlify 的步骤

8. **许可证**
   - MIT License

将文件保存为 README.md
```

**构建生产版本**：

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

**部署到 Vercel（示例）**：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

---

## 完整命令速查

### 项目管理命令

```bash
# 获取下一个任务
node scripts/task.js next

# 更新任务状态
node scripts/task.js update T001 in-progress
node scripts/task.js update T001 completed

# 列出所有任务
node scripts/task.js list

# 列出特定状态的任务
node scripts/task.js list pending
node scripts/task.js list completed

# 查看项目结构
tree -L 3 -I 'node_modules'

# 查看 Git 状态
git status

# 查看任务进度
cat tasks.md
```

### 开发命令

```bash
# 启动 Claude Code
claude

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 运行测试（监听模式）
npm test -- --watch

# 查看测试覆盖率
npm run test:coverage

# 代码检查
npm run lint

# 自动修复 lint 问题
npm run lint:fix

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览构建
npm run preview
```

### Git 工作流命令

```bash
# 创建功能分支
git checkout -b feature/task-name

# 查看改动
git diff

# 暂存文件
git add src/components/Timer.tsx

# 提交（使用 Claude 生成的提交信息）
git commit -m "feat(timer): implement basic timer functionality"

# 推送分支
git push origin feature/task-name

# 创建 worktree（并行开发）
git worktree add ../project-feature feature/name

# 列出 worktrees
git worktree list

# 删除 worktree
git worktree remove ../project-feature
```

### Claude Code 常用命令

```
在 Claude Code 交互中：

/help          - 查看帮助
/clear         - 清除对话历史
/compact       - 压缩对话历史
/rewind        - 回滚到之前的检查点
ESC ESC        - 快速回滚
/bug           - 报告问题
/exit          - 退出 Claude Code
```

---

## 提示词模板速查

### 快速启动模板

```
【需求收集】
🎯 角色：产品负责人
任务：明确[功能]的需求，提出5-7个关键问题

【架构设计】
🎯 角色：软件架构师
任务：基于需求设计技术栈和系统架构

【任务分解】
🎯 角色：技术主管
任务：将项目分解为2-4小时的开发任务

【TDD 开发】
🎯 开始任务：[任务ID]
使用TDD流程：规划 → 测试 → 实现 → 重构 → 验收

【代码审查】
🎯 审查任务：[任务ID]
检查：功能正确性、代码质量、测试覆盖、架构一致性

【集成测试】
🎯 角色：质量保证
任务：功能测试、端到端测试、性能测试、兼容性测试
```

### 问题解决模板

```
【卡住时】
我在实现[功能]时遇到问题：
[问题描述]

已尝试的方案：
1. [方案1] - 结果：[...]
2. [方案2] - 结果：[...]

请提供 2-3 个新的解决方案，分析利弊。

【需要人工干预】
任务 [ID] 需要人工介入：

原因：[API密钥/环境配置/设计决策/...]

需要你提供：
1. [具体信息]
2. [具体操作]

完成后请回复 "continue" 并提供必要信息。

【上下文重绕】
使用 /rewind 回到 [检查点]，重新考虑 [问题]。

请分析：
1. 根本原因
2. 2-3个替代方案
3. 推荐方案及理由
```

---

## 实际开发时间线（参考）

基于番茄时钟应用的复杂度：

| 阶段 | 预计时间 | 实际任务 |
|------|---------|---------|
| 项目初始化 | 15分钟 | 运行脚本、配置环境 |
| 需求收集 | 30分钟 | 对话、明确需求、生成文档 |
| 架构设计 | 45分钟 | 选择技术栈、设计架构、初始化项目 |
| 任务分解 | 30分钟 | 分解任务、排序、审查 |
| 核心开发 | 8-12小时 | 迭代开发各个功能 |
| 测试完善 | 2-3小时 | 补充测试、集成测试 |
| 文档和部署 | 1-2小时 | README、部署配置 |
| **总计** | **13-19小时** | **约2-3个工作日** |

---

## 常见问题

### Q1: Claude Code 会话断开怎么办？

```bash
# 重新启动 Claude Code
claude

# 然后输入：
请读取以下文件了解项目状态：
- CLAUDE.md（项目概览）
- tasks.md（任务进度）
- task_status.json（详细状态）
- .claude/context_memory.json（上下文）

我们刚完成了任务 [上一个任务ID]。
请帮我继续下一个任务。
```

### Q2: 测试一直失败怎么办？

```
进入调试模式：

问题：[描述测试失败的情况]
错误信息：[复制错误日志]

请按以下步骤调试：
1. 分析错误根源
2. 检查相关代码逻辑
3. 提出修复方案（2-3个）
4. 实施最佳方案
5. 验证修复

如果尝试 5 次仍未解决，暂停并总结问题，我会人工介入。
```

### Q3: 如何查看项目整体进度？

```bash
# 任务统计
node scripts/task.js list

# 代码统计
npx cloc src/

# Git 提交历史
git log --oneline --graph

# 测试覆盖率
npm run test:coverage
```

### Q4: 如何添加新功能？

```
发现需要添加新功能：[功能描述]

请：
1. 更新 product_requirements.md
2. 创建新任务添加到 task_status.json
3. 分析依赖关系
4. 建议插入位置（在哪个任务之后）

生成任务卡片格式：
{
  "id": "T0XX",
  "title": "...",
  "priority": "中",
  "dependencies": ["..."],
  ...
}
```

---

## 检查清单

### 开发前检查

- [ ] 安装了 Node.js 和 npm
- [ ] 安装了 Claude Code
- [ ] 已登录 Claude Code
- [ ] 已初始化 Git 仓库
- [ ] 运行了项目初始化脚本

### 每个任务开始前

- [ ] 运行 `node scripts/task.js next` 获取任务
- [ ] 阅读任务详情和验收标准
- [ ] 确认依赖任务已完成
- [ ] 更新任务状态为 `in-progress`

### 每个任务完成后

- [ ] 所有测试通过 `npm test`
- [ ] 代码通过 lint 检查 `npm run lint`
- [ ] 验收标准全部满足
- [ ] 提交代码到 Git
- [ ] 更新任务状态为 `completed`

### 项目完成前

- [ ] 所有任务状态为 `completed`
- [ ] 测试覆盖率 > 80%
- [ ] 无 ESLint 错误
- [ ] README.md 完善
- [ ] 构建成功 `npm run build`
- [ ] 部署成功并可访问

---

## 下一步建议

完成番茄时钟应用后，你可以：

1. **扩展功能**
   - 添加用户账户系统
   - 实现数据云同步
   - 添加团队协作功能
   - 集成日历应用

2. **优化性能**
   - 实现 PWA（渐进式 Web 应用）
   - 添加离线支持
   - 优化加载速度

3. **学习进阶**
   - 尝试其他类型的项目（博客、电商、仪表盘）
   - 学习 Claude Code 的高级功能（MCP servers、hooks）
   - 探索多代理协作模式

4. **社区贡献**
   - 开源你的项目
   - 分享开发经验
   - 改进工作流程

---

**文档版本**: 1.0  
**最后更新**: 2025-10-01  
**适用于**: Claude Code 2.0 + GPT-Pilot 工作流  
**项目示例**: 番茄时钟应用

**祝你开发顺利！🎉**
