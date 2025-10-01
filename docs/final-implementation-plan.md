# Claude Code GPT-Pilot v2.0 - 最终实施方案

## 📋 方案确认

基于用户反馈，最终确定的实施方案：

### ✅ 架构决策
- **方案**: 混合式架构（方案C）
- **任务管理**: `.claude-pilot/tools/task.js`（JavaScript）
- **任务执行**: Claude（developer.md Agent）
- **自动化范围**: 只实现 `/developer-auto`

---

## 🏗️ 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────┐
│  用户在 Claude Code 中输入命令                       │
│  - /developer T001 (单任务模式)                      │
│  - /developer-auto T001 (自动化模式)                 │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│  CLAUDE.md 智能约定系统                              │
│  - 识别命令类型                                      │
│  - 加载对应的 Agent 模板                             │
└──────────────┬──────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
   单任务模式      自动化模式
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────────────────────────┐
│ developer.md │  │ 自动化执行逻辑                    │
│ Agent 模板   │  │ (在 developer.md 中定义)          │
│              │  │                                  │
│ TDD 5阶段    │  │ 1. 调用 task.js 获取任务列表      │
│ 流程         │  │ 2. 循环执行每个任务               │
│              │  │ 3. 调用 task.js 更新状态          │
└──────────────┘  │ 4. 处理错误和进度显示             │
                  └──────────┬───────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              读取任务列表      更新任务状态
                    │                 │
                    ▼                 ▼
            ┌──────────────────────────────┐
            │ .claude-pilot/tools/task.js  │
            │                              │
            │ - getAllExecutableTasks()    │
            │ - checkDependencies()        │
            │ - updateTaskStatus()         │
            │ - displayProgress()          │
            └──────────────────────────────┘
                    │
                    ▼
            ┌──────────────────────────────┐
            │ task_status.json             │
            │ (任务状态数据)                │
            └──────────────────────────────┘
```

---

## 📁 项目结构（更新）

```
项目根目录/
├── .claude-pilot/              # Agent 系统核心
│   ├── agents/
│   │   └── agents.json        # Agent 元数据配置
│   ├── templates/             # 7个 Agent 提示词模板
│   │   ├── product-owner.md
│   │   ├── architect.md
│   │   ├── tech-lead.md
│   │   ├── developer.md       # 支持双模式
│   │   ├── tester.md
│   │   ├── reviewer.md
│   │   └── debugger.md
│   ├── tools/                 # 工具脚本（新增）
│   │   └── task.js           # 任务管理工具
│   ├── context_memory.json    # 上下文记忆
│   └── README.md
│
├── docs/                      # 自动生成的文档
│   ├── product_requirements.md
│   └── architecture.md
│
├── src/                       # 源代码
├── tests/                     # 测试文件
├── tasks.md                   # 任务列表
├── task_status.json           # 任务状态
├── CLAUDE.md                  # 智能约定文件
└── README.md
```

**关键变化**：
- ✅ 新增 `.claude-pilot/tools/` 目录
- ✅ task.js 放在 `.claude-pilot/tools/task.js`
- ✅ 与项目代码完全分离

---

## 🔧 核心组件设计

### 1. task.js 工具

**位置**: `.claude-pilot/tools/task.js`

**功能**:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 配置
const TASK_STATUS_FILE = path.join(process.cwd(), 'task_status.json');

// ========== 核心功能 ==========

// 1. 加载任务状态
function loadTaskStatus() {
  try {
    return JSON.parse(fs.readFileSync(TASK_STATUS_FILE, 'utf8'));
  } catch (e) {
    console.error('❌ task_status.json 不存在，请先运行 /tech-lead');
    process.exit(1);
  }
}

// 2. 保存任务状态
function saveTaskStatus(status) {
  fs.writeFileSync(TASK_STATUS_FILE, JSON.stringify(status, null, 2));
}

// 3. 获取所有可执行任务（新增）
function getAllExecutableTasks() {
  const status = loadTaskStatus();
  const pending = status.tasks.filter(t => t.status === 'pending');
  
  const executable = pending.filter(task => {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }
    return task.dependencies.every(depId => {
      const dep = status.tasks.find(t => t.id === depId);
      return dep && dep.status === 'completed';
    });
  });
  
  // 按优先级排序
  const priorities = { '高': 0, '中': 1, '低': 2 };
  return executable.sort((a, b) => 
    priorities[a.priority] - priorities[b.priority]
  );
}

// 4. 检查任务依赖（新增）
function checkDependencies(taskId) {
  const status = loadTaskStatus();
  const task = status.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return { error: `任务 ${taskId} 不存在` };
  }
  
  if (!task.dependencies || task.dependencies.length === 0) {
    return { ready: true, missing: [] };
  }
  
  const missing = task.dependencies.filter(depId => {
    const dep = status.tasks.find(t => t.id === depId);
    return !dep || dep.status !== 'completed';
  });
  
  return {
    ready: missing.length === 0,
    missing: missing,
    dependencies: task.dependencies
  };
}

// 5. 获取下一个任务
function getNextTask() {
  const executable = getAllExecutableTasks();
  
  if (executable.length > 0) {
    const next = executable[0];
    console.log(`\n📋 下一个任务: ${next.id}`);
    console.log(`📝 ${next.title}`);
    console.log(`⏱️  预计: ${next.estimated_hours}小时`);
    console.log(`🎯 优先级: ${next.priority}`);
    console.log(`\n${next.description}`);
    console.log(`\n验收标准:`);
    next.acceptance_criteria.forEach((c, i) => 
      console.log(`  ${i+1}. ${c}`)
    );
    console.log(`\n💡 开始任务: /developer ${next.id}`);
    return next;
  } else {
    const status = loadTaskStatus();
    const allCompleted = status.tasks.every(t => t.status === 'completed');
    
    if (allCompleted) {
      console.log('\n🎉 所有任务已完成！');
    } else {
      console.log('\n⚠️ 无可执行任务（可能存在依赖问题）');
    }
    return null;
  }
}

// 6. 更新任务状态
function updateTaskStatus(taskId, newStatus) {
  const status = loadTaskStatus();
  const task = status.tasks.find(t => t.id === taskId);
  
  if (task) {
    task.status = newStatus;
    task.updated_at = new Date().toISOString();
    if (newStatus === 'completed') {
      task.completed_at = new Date().toISOString();
    }
    saveTaskStatus(status);
    console.log(`✅ 任务 ${taskId} → ${newStatus}`);
  } else {
    console.error(`❌ 未找到任务: ${taskId}`);
  }
}

// 7. 列出任务
function listTasks(filterStatus) {
  const status = loadTaskStatus();
  let tasks = status.tasks;
  
  if (filterStatus) {
    tasks = tasks.filter(t => t.status === filterStatus);
  }
  
  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };
  
  console.log(`\n📊 任务统计:`);
  console.log(`  待办: ${stats.pending} | 进行中: ${stats['in-progress']} | 完成: ${stats.completed}`);
  
  console.log(`\n任务列表:`);
  tasks.forEach(t => {
    const icon = {
      pending: '⏳',
      'in-progress': '🔄',
      completed: '✅'
    }[t.status] || '❓';
    console.log(`  ${icon} ${t.id}: ${t.title} [${t.status}]`);
  });
}

// ========== 命令行接口 ==========

const [,, command, ...args] = process.argv;

switch (command) {
  case 'executable':
    // 输出 JSON 格式，供 Claude 解析
    console.log(JSON.stringify(getAllExecutableTasks(), null, 2));
    break;
    
  case 'check-deps':
    const result = checkDependencies(args[0]);
    console.log(JSON.stringify(result, null, 2));
    break;
    
  case 'next':
    getNextTask();
    break;
    
  case 'update':
    updateTaskStatus(args[0], args[1]);
    break;
    
  case 'list':
    listTasks(args[0]);
    break;
    
  default:
    console.log(`
用法:
  node .claude-pilot/tools/task.js executable           - 获取所有可执行任务（JSON）
  node .claude-pilot/tools/task.js check-deps <ID>      - 检查任务依赖
  node .claude-pilot/tools/task.js next                 - 获取下一个任务
  node .claude-pilot/tools/task.js update <ID> <状态>   - 更新任务状态
  node .claude-pilot/tools/task.js list [状态]          - 列出任务

状态: pending | in-progress | completed
    `);
}
```

---

## 📊 开发计划（更新）

### 总体时间估算：15.5小时

| 阶段 | 任务 | 时间 | 状态 |
|------|------|------|------|
| **阶段1** | CLI 工具开发 | 2h | ⏳ 待开始 |
| **阶段2** | Agent 模板编写 | 3h | ⏳ 待开始 |
| **阶段3** | CLAUDE.md 设计 | 1.5h | ⏳ 待开始 |
| **阶段4** | task.js 工具开发 | 2h | ⏳ 待开始 |
| **阶段5** | 自动化功能集成 | 2.5h | ⏳ 待开始 |
| **阶段6** | 测试和优化 | 2h | ⏳ 待开始 |
| **阶段7** | 文档和示例 | 2.5h | ⏳ 待开始 |
| **总计** | | **15.5h** | |

### 详细任务分解

#### 阶段1: CLI 工具开发（2小时）
- [ ] 创建 npm 包结构
- [ ] 实现 `init` 命令
- [ ] 生成目录结构逻辑
- [ ] 模板文件复制逻辑
- [ ] 变量替换功能

#### 阶段2: Agent 模板编写（3小时）
- [ ] product-owner.md（30分钟）
- [ ] architect.md（30分钟）
- [ ] tech-lead.md（30分钟）
- [ ] developer.md（30分钟）- 单任务模式
- [ ] tester.md（20分钟）
- [ ] reviewer.md（20分钟）
- [ ] debugger.md（20分钟）

#### 阶段3: CLAUDE.md 设计（1.5小时）
- [ ] 基础命令定义（7个 Agent）
- [ ] `/developer` 单任务模式流程
- [ ] `/developer-auto` 自动化模式流程
- [ ] 辅助命令（/status, /next-task 等）

#### 阶段4: task.js 工具开发（2小时）
- [ ] 基础函数（load, save, update）
- [ ] getAllExecutableTasks() 实现
- [ ] checkDependencies() 实现
- [ ] 命令行接口
- [ ] 单元测试

#### 阶段5: 自动化功能集成（2.5小时）
- [ ] developer.md 自动化模式逻辑
- [ ] CLAUDE.md 中的 /developer-auto 定义
- [ ] 循环控制逻辑
- [ ] 进度显示格式
- [ ] 错误处理流程

#### 阶段6: 测试和优化（2小时）
- [ ] 创建测试项目
- [ ] 测试单任务模式
- [ ] 测试自动化模式（简单场景）
- [ ] 测试自动化模式（复杂场景）
- [ ] 测试错误处理
- [ ] 性能优化

#### 阶段7: 文档和示例（2.5小时）
- [ ] README.md
- [ ] 使用指南
- [ ] 最佳实践
- [ ] 示例项目
- [ ] 故障排除指南

---

## 🎯 下一步行动

### 立即行动

**进入 PLAN 模式（Ω₃）**：
1. 制定详细的模块化开发计划
2. 定义所有文件结构和接口
3. 分解成具体的实现任务

**然后进入 EXECUTE 模式（Ω₄）**：
1. 按照 AugmentRIPER♦Σ 框架规范开发
2. 严格遵循 TDD 流程
3. 每个任务完成后 git commit
4. 自动更新 memory-bank

---

## ✅ 确认检查清单

- [x] 架构方案确定（方案C - 混合式）
- [x] task.js 位置确定（`.claude-pilot/tools/task.js`）
- [x] 自动化范围确定（只实现 `/developer-auto`）
- [x] 项目结构设计完成
- [x] 开发计划制定完成
- [ ] 等待用户确认开始开发

---

## 🚀 准备开始

一切准备就绪！

**请明确表示 "确认开始开发"**，我将立即：
1. 进入 PLAN 模式（Ω₃）制定详细计划
2. 进入 EXECUTE 模式（Ω₄）开始实现
3. 按照 15.5 小时的开发计划逐步完成

**期待您的确认！** 🎯

