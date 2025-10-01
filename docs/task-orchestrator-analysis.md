# 任务编排器架构分析

## 📋 问题背景

用户提出的核心问题：
> 是否需要为 `/developer` 和 `/developer-auto` 命令设计一个专门的**任务编排器（Task Orchestrator）**组件？

---

## 🔍 GPT-Pilot 和 Claude Code 的现有实现分析

### 1. GPT-Pilot 的任务管理机制

基于对参考文档的分析，GPT-Pilot 采用的是**混合式架构**：

#### 核心组件

**A. 任务管理脚本 (`scripts/task.js`)**
```javascript
// 职责：
- 读取和更新 task_status.json
- 依赖检查逻辑
- 获取下一个可执行任务
- 任务状态更新

// 关键函数：
function getNextTask() {
  const pending = status.tasks.filter(t => t.status === 'pending');
  const ready = pending.filter(task => {
    return task.dependencies.every(depId => {
      const dep = status.tasks.find(t => t.id === depId);
      return dep && dep.status === 'completed';
    });
  });
  // 返回优先级最高的可执行任务
}
```

**B. 命令处理器 (`command-handler.js`)**
```javascript
// 职责：
- 解析用户命令
- 加载 Agent 模板
- 注入变量
- 生成最终提示词

// 特点：
- 不负责任务编排
- 只负责单次命令处理
- 生成提示词后交给用户复制到 Claude Code
```

**C. 工作流自动化脚本 (`auto-workflow.sh`)**
```javascript
// 职责：
- 串联多个 Agent 调用
- 等待用户确认后继续
- 简单的顺序执行

// 特点：
- 外部 bash 脚本
- 需要人工确认
- 不处理复杂依赖
```

#### 关键发现

1. **任务管理和执行是分离的**
   - `task.js` 负责任务管理（依赖检查、状态更新）
   - `command-handler.js` 负责生成提示词
   - 两者通过文件系统（task_status.json）通信

2. **没有真正的自动化编排器**
   - `auto-workflow.sh` 只是简单的顺序脚本
   - 每个步骤都需要人工确认
   - 不支持复杂的依赖管理和错误恢复

3. **依赖 Claude 执行实际工作**
   - 脚本只负责准备和管理
   - 实际的代码生成、测试等由 Claude 完成
   - Claude 通过读取文件获取上下文

---

## 🎯 两种方案的详细对比

### 方案A：集成式设计（当前方案）

#### 架构图
```
用户输入 /developer-auto T001
    ↓
CLAUDE.md 识别命令
    ↓
加载 developer.md 模板
    ↓
Claude 理解并执行：
  - 读取 task_status.json
  - 循环执行任务
  - 检查依赖
  - 更新状态
  - 处理错误
```

#### 实现方式
```markdown
# 在 developer.md 中定义
## 🔁 自动化模式执行流程

WHILE (还有待执行任务):
  1. 读取 task_status.json
  2. 获取下一个可执行任务（依赖已满足）
  3. 如果没有可执行任务 → 退出
  4. 显示进度信息
  5. 执行 TDD 5阶段
  6. 如果成功：
     - 更新任务状态为 completed
     - git commit
     - 继续下一个
  7. 如果失败：
     - 显示错误
     - 退出循环
```

#### 优点
✅ **实现简单**
- 无需额外开发组件
- 纯 Markdown 配置
- 符合 CLAUDE.md 智能约定系统的设计理念

✅ **用户体验流畅**
- 全程在 Claude Code 内完成
- 无需切换工具
- 一个命令完成所有操作

✅ **维护成本低**
- 只需维护 Markdown 文件
- 逻辑清晰可读
- 易于调整和优化

#### 缺点
❌ **依赖 Claude 的理解能力**
- 复杂的循环逻辑可能不够可靠
- 依赖检查可能出错
- 状态管理可能不一致

❌ **调试困难**
- 无法单步调试
- 错误难以定位
- 无法打断点

❌ **可控性较弱**
- 无法精确控制执行流程
- 难以实现复杂的错误恢复
- 无法实时监控状态

#### 风险评估
🔴 **高风险场景**：
- 任务数量 > 20 个
- 复杂的依赖关系（多层依赖、循环依赖）
- 需要精确的错误恢复机制

🟡 **中风险场景**：
- 任务数量 10-20 个
- 简单的线性依赖
- 可以接受偶尔的失败

🟢 **低风险场景**：
- 任务数量 < 10 个
- 无依赖或简单依赖
- 用户可以手动干预

---

### 方案B：编排器设计（新方案）

#### 架构图
```
用户输入 /developer-auto T001
    ↓
CLAUDE.md 识别命令
    ↓
触发 task-orchestrator.js
    ↓
编排器执行：
  - 读取 task_status.json
  - 解析依赖关系
  - 确定执行顺序
  - 循环调用 /developer [任务ID]
  - 监控执行状态
  - 处理错误
  - 更新进度
```

#### 实现方式

**A. 创建独立的编排器脚本**
```javascript
// .claude-pilot/orchestrator/task-orchestrator.js

class TaskOrchestrator {
  constructor(taskStatusFile) {
    this.taskStatus = this.loadTaskStatus(taskStatusFile);
    this.executionState = {
      mode: 'auto',
      startTask: null,
      endTask: null,
      currentTask: null,
      completedTasks: [],
      failedTask: null
    };
  }

  // 获取下一个可执行任务
  getNextExecutableTask() {
    const pending = this.taskStatus.tasks.filter(t => t.status === 'pending');
    
    return pending.find(task => {
      // 检查依赖是否全部完成
      if (!task.dependencies || task.dependencies.length === 0) {
        return true;
      }
      return task.dependencies.every(depId => {
        const dep = this.taskStatus.tasks.find(t => t.id === depId);
        return dep && dep.status === 'completed';
      });
    });
  }

  // 执行单个任务
  async executeTask(taskId) {
    console.log(`🔄 执行任务: ${taskId}`);
    
    // 调用 Claude Code 执行 /developer 命令
    // 这里需要与 Claude Code 集成
    const result = await this.invokeDeveloperAgent(taskId);
    
    if (result.success) {
      this.updateTaskStatus(taskId, 'completed');
      this.executionState.completedTasks.push(taskId);
      return true;
    } else {
      this.executionState.failedTask = taskId;
      throw new Error(`任务 ${taskId} 执行失败: ${result.error}`);
    }
  }

  // 自动化执行主循环
  async autoExecute(startTaskId, endTaskId) {
    this.executionState.startTask = startTaskId;
    this.executionState.endTask = endTaskId;
    
    while (true) {
      const nextTask = this.getNextExecutableTask();
      
      if (!nextTask) {
        // 检查是否所有任务都完成
        const allCompleted = this.taskStatus.tasks.every(
          t => t.status === 'completed'
        );
        
        if (allCompleted) {
          console.log('🎉 所有任务执行完成！');
          this.displaySummary();
          break;
        } else {
          console.log('⚠️ 无可执行任务，可能存在依赖问题');
          break;
        }
      }
      
      // 显示进度
      this.displayProgress(nextTask);
      
      try {
        await this.executeTask(nextTask.id);
      } catch (error) {
        console.error(`❌ 执行失败: ${error.message}`);
        this.displayError(nextTask, error);
        this.saveExecutionState();
        break;
      }
    }
  }
}
```

**B. 在 CLAUDE.md 中定义触发方式**
```markdown
#### `/developer-auto [起始任务ID]`

**执行流程**:
1. 识别命令和参数
2. 调用任务编排器：
   ```
   node .claude-pilot/orchestrator/task-orchestrator.js auto T001
   ```
3. 编排器自动执行：
   - 读取任务列表
   - 检查依赖
   - 循环调用 /developer
   - 监控进度
   - 处理错误
```

#### 优点
✅ **可靠性高**
- 精确的依赖检查
- 可靠的状态管理
- 确定性的执行流程

✅ **可调试**
- 可以单步调试
- 可以打断点
- 可以查看详细日志

✅ **可扩展**
- 易于添加新功能
- 支持复杂的编排逻辑
- 可以集成其他工具

✅ **错误处理强大**
- 精确的错误捕获
- 详细的错误报告
- 支持错误恢复和重试

#### 缺点
❌ **实现复杂**
- 需要开发额外的 JavaScript 组件
- 需要处理与 Claude Code 的集成
- 增加系统复杂度

❌ **用户体验可能受影响**
- 需要在 Claude Code 和编排器之间切换
- 可能需要额外的配置
- 学习曲线更陡

❌ **维护成本高**
- 需要维护额外的代码
- 需要处理兼容性问题
- 需要编写测试

#### 关键挑战
🔴 **与 Claude Code 的集成**
- 如何从编排器调用 Claude Code？
- 如何获取 Claude Code 的执行结果？
- 如何处理 Claude Code 的错误？

---

## 💡 推荐方案：混合式架构（方案C）

基于对 GPT-Pilot 实现的分析和两种方案的对比，我推荐采用**混合式架构**：

### 核心思路

**将任务管理和任务执行分离，但保持在 Claude Code 内的流畅体验**

### 架构设计

```
┌─────────────────────────────────────────┐
│  用户在 Claude Code 中输入命令          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  CLAUDE.md 识别命令                      │
│  - /developer T001 → 单任务模式          │
│  - /developer-auto → 自动化模式          │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
   单任务模式      自动化模式
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────────────┐
│ developer.md │  │ 轻量级任务调度逻辑    │
│ Agent 模板   │  │ (在 CLAUDE.md 中定义) │
└──────────────┘  └──────────┬───────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              读取任务列表      循环调用
                    │           /developer
                    ▼                 │
            ┌──────────────┐          │
            │ task.js 工具 │◄─────────┘
            │ (依赖检查)   │
            └──────────────┘
```

### 具体实现

#### 1. 保留方案A的核心（CLAUDE.md 智能约定）

```markdown
# CLAUDE.md

#### `/developer-auto [起始任务ID]`

**执行流程**:
1. 读取 task_status.json
2. 调用辅助函数获取任务列表：
   ```
   请执行以下 Node.js 代码获取任务列表：
   node -e "
   const fs = require('fs');
   const status = JSON.parse(fs.readFileSync('task_status.json'));
   const pending = status.tasks.filter(t => t.status === 'pending');
   const ready = pending.filter(task => {
     if (!task.dependencies) return true;
     return task.dependencies.every(depId => {
       const dep = status.tasks.find(t => t.id === depId);
       return dep && dep.status === 'completed';
     });
   });
   console.log(JSON.stringify(ready, null, 2));
   "
   ```
3. 对于每个可执行任务：
   - 切换到 developer.md Agent 模式
   - 执行 TDD 5阶段
   - 更新任务状态
   - 继续下一个
```

#### 2. 增强 task.js 工具

```javascript
// scripts/task.js

// 新增功能：获取所有可执行任务
function getAllExecutableTasks() {
  const status = loadStatus();
  const pending = status.tasks.filter(t => t.status === 'pending');
  
  return pending.filter(task => {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every(depId => {
      const dep = status.tasks.find(t => t.id === depId);
      return dep && dep.status === 'completed';
    });
  });
}

// 新增功能：批量状态检查
function checkDependencies(taskId) {
  const status = loadStatus();
  const task = status.tasks.find(t => t.id === taskId);
  
  if (!task.dependencies) return { ready: true, missing: [] };
  
  const missing = task.dependencies.filter(depId => {
    const dep = status.tasks.find(t => t.id === depId);
    return !dep || dep.status !== 'completed';
  });
  
  return {
    ready: missing.length === 0,
    missing: missing
  };
}

// 命令行接口
switch (command) {
  case 'executable':
    console.log(JSON.stringify(getAllExecutableTasks(), null, 2));
    break;
  case 'check-deps':
    const result = checkDependencies(args[0]);
    console.log(JSON.stringify(result, null, 2));
    break;
  // ... 其他命令
}
```

#### 3. 在 developer.md 中定义清晰的调用方式

```markdown
# developer.md

## 🔁 自动化模式执行流程

### 初始化
1. 获取所有可执行任务：
   ```bash
   node scripts/task.js executable
   ```
2. 解析结果，确定执行顺序

### 循环执行
FOR EACH 可执行任务:
  1. 显示进度信息
  2. 执行 TDD 5阶段（调用单任务模式逻辑）
  3. 更新任务状态：
     ```bash
     node scripts/task.js update [任务ID] completed
     ```
  4. 检查是否有新的可执行任务：
     ```bash
     node scripts/task.js executable
     ```
  5. 如果有，继续；如果没有，检查是否全部完成

### 错误处理
- 任何阶段失败 → 立即停止
- 保存当前进度
- 显示详细错误信息
```

### 方案C的优势

✅ **兼顾可靠性和简洁性**
- 依赖检查由可靠的 JavaScript 代码完成
- 任务执行由 Claude 完成（发挥其优势）
- 状态管理通过文件系统（简单可靠）

✅ **保持流畅的用户体验**
- 全程在 Claude Code 内完成
- 无需切换工具
- 一个命令启动自动化

✅ **易于调试和维护**
- task.js 可以单独测试
- Claude 的执行逻辑清晰可读
- 问题容易定位

✅ **渐进式增强**
- 先实现基础功能
- 后续可以逐步增强 task.js
- 不影响现有功能

---

## 🎯 最终推荐

### 推荐方案：**方案C（混合式架构）**

### 理由

1. **借鉴 GPT-Pilot 的成功经验**
   - GPT-Pilot 也采用类似的混合架构
   - 任务管理用脚本，执行用 AI
   - 已被验证是可行的

2. **平衡复杂度和可靠性**
   - 不像方案A那样完全依赖 Claude
   - 不像方案B那样需要复杂的编排器
   - 恰到好处的分工

3. **符合 CLAUDE.md 智能约定的理念**
   - 仍然通过 CLAUDE.md 定义命令
   - 仍然在 Claude Code 内执行
   - 只是借助外部工具做辅助

4. **易于实现和维护**
   - task.js 已经在 GPT-Pilot 中存在
   - 只需增强功能，不需要从头开发
   - 维护成本可控

### 实施建议

#### 阶段1：基础实现（2小时）
- 增强 task.js，添加 `executable` 和 `check-deps` 命令
- 在 CLAUDE.md 中定义 `/developer-auto` 命令
- 在 developer.md 中定义自动化执行逻辑

#### 阶段2：测试和优化（1小时）
- 测试简单场景（5个任务，线性依赖）
- 测试复杂场景（15个任务，多层依赖）
- 优化错误处理和进度显示

#### 阶段3：文档和示例（30分钟）
- 编写使用文档
- 创建示例项目
- 记录最佳实践

### 未来扩展方向

如果方案C在实践中遇到瓶颈，可以考虑：

1. **增强 task.js 为轻量级编排器**
   - 添加更多任务管理功能
   - 支持任务优先级调度
   - 支持并行执行（如果可能）

2. **开发专门的编排器（方案B）**
   - 只在确实需要时才开发
   - 基于实际需求设计
   - 保持向后兼容

---

## ✅ 总结

| 方案 | 可靠性 | 复杂度 | 用户体验 | 推荐度 |
|------|--------|--------|---------|--------|
| 方案A（集成式） | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 方案B（编排器） | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **方案C（混合式）** | **⭐⭐⭐⭐** | **⭐⭐⭐⭐** | **⭐⭐⭐⭐⭐** | **⭐⭐⭐⭐⭐** |

**最终决策：方案C（混合式架构）** ✅

这个方案：
- ✅ 借鉴了 GPT-Pilot 的成功经验
- ✅ 平衡了可靠性和复杂度
- ✅ 保持了流畅的用户体验
- ✅ 易于实现和维护
- ✅ 支持未来扩展

---

## 📋 用户确认的设计决策

**日期**: 2025-01-01

### 决策1: 架构方案
✅ **采用方案C（混合式架构）**
- 任务管理用 JavaScript（task.js）
- 任务执行用 Claude（developer.md Agent）
- 通过 CLAUDE.md 定义命令

### 决策2: task.js 位置
✅ **放在 `.claude-pilot/tools/task.js`**
- 理由：与目标项目代码不混淆
- 所有系统文件集中在 `.claude-pilot/` 目录

### 决策3: 自动化范围
✅ **只实现 `/developer-auto`**
- 专注于核心需求
- 不实现完整的工作流自动化（`/auto-workflow`）
- 后续可根据需要扩展

