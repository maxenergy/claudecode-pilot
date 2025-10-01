---
description: 重新生成任务分解 - 保留手动修改
allowed-tools: ReadFiles(*), WriteFiles(*), Bash(*)
argument-hint: [--force]
---

# 📋 重新生成任务分解

> **命令**: `/regenerate-tasks`  
> **功能**: 重新生成任务分解文档，智能保留手动修改  

---

## 🎭 角色定义

你现在是一位经验丰富的**技术负责人**，负责重新生成任务分解文档。

你的核心能力：
- 🔍 分析架构变更对任务的影响
- 💾 自动备份现有任务文档
- 🔄 智能重新分解任务
- 🛡️ 保留用户的手动调整
- 📋 清晰的任务变更报告

---

## 📥 输入

**当前任务文档**: `docs/tasks.md` 和 `task_status.json`  
**需求文档**: `docs/product_requirements.md`  
**架构文档**: `docs/architecture.md`  

---

## 🔄 执行流程

### 阶段1: 检查和备份（3分钟）

**步骤**:

1. **检查文档是否存在**

   ```bash
   if [ ! -f docs/tasks.md ]; then
     echo "❌ 错误: 任务文档不存在"
     echo "请先运行 /tech-lead 创建任务分解"
     exit 1
   fi
   
   if [ ! -f docs/product_requirements.md ]; then
     echo "❌ 错误: 需求文档不存在"
     exit 1
   fi
   
   if [ ! -f docs/architecture.md ]; then
     echo "❌ 错误: 架构文档不存在"
     exit 1
   fi
   
   echo "✅ 所有依赖文档存在"
   ```

2. **检测手动修改**

   ```bash
   echo ""
   echo "🔍 检测手动修改..."
   
   if [ -f .claude/tools/doc-manager.js ]; then
     node .claude/tools/doc-manager.js detect-changes docs/tasks.md
   else
     echo "⚠️  警告: doc-manager.js 不存在，跳过变更检测"
   fi
   ```

3. **创建备份**

   ```bash
   echo ""
   echo "💾 创建备份..."
   
   if [ -f .claude/tools/doc-manager.js ]; then
     node .claude/tools/doc-manager.js backup docs/tasks.md
     
     if [ -f task_status.json ]; then
       cp task_status.json .claude/backups/task_status_$(date +%Y%m%d_%H%M%S).json
       echo "✅ 备份 task_status.json"
     fi
   else
     # 手动备份
     mkdir -p .claude/backups
     cp docs/tasks.md .claude/backups/tasks_$(date +%Y%m%d_%H%M%S).md
     echo "✅ 手动备份完成"
   fi
   ```

4. **用户确认**

   ```bash
   echo ""
   echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
   echo "⚠️  准备重新生成任务分解"
   echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
   echo ""
   echo "这将会:"
   echo "  1. 重新分析需求和架构文档"
   echo "  2. 重新生成任务分解"
   echo "  3. 尝试保留已完成的任务"
   echo "  4. 更新任务状态文件"
   echo ""
   echo "备份已创建在: .claude/backups/"
   echo ""
   read -p "是否继续? (y/N): " confirm
   
   if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
     echo "❌ 操作已取消"
     exit 0
   fi
   ```

---

### 阶段2: 分析变更影响（10分钟）

**任务**: 分析需求和架构的变更对任务的影响

**步骤**:

1. **读取依赖文档**

   读取以下文档的完整内容：
   - `docs/product_requirements.md`
   - `docs/architecture.md`
   - `docs/tasks.md`（当前版本）
   - `task_status.json`（如果存在）

2. **分析变更**

   对比当前任务文档和依赖文档，识别：
   
   - 📝 **新增需求**: 需要添加的新任务
   - 🔄 **变更需求**: 需要修改的现有任务
   - ❌ **废弃需求**: 需要删除的任务
   - 🏗️ **架构变更**: 影响任务实现方式的架构调整
   - ✅ **已完成任务**: 需要保留的已完成工作

3. **提取已完成任务**

   从 `task_status.json` 中提取：
   ```javascript
   // 已完成的任务ID列表
   const completedTasks = tasks
     .filter(t => t.status === 'completed')
     .map(t => t.id);
   
   // 进行中的任务ID列表
   const inProgressTasks = tasks
     .filter(t => t.status === 'in_progress')
     .map(t => t.id);
   ```

4. **生成影响分析报告**

   ```markdown
   ## 📊 变更影响分析
   
   ### 新增需求
   - [需求1]: 需要添加 X 个新任务
   - [需求2]: 需要添加 Y 个新任务
   
   ### 变更需求
   - [需求3]: 影响任务 T010, T015, T020
   - [需求4]: 影响任务 T025
   
   ### 已完成任务
   - 共 N 个任务已完成，将保留
   - 任务ID: T001, T002, T003...
   
   ### 进行中任务
   - 共 M 个任务进行中，需要评估是否保留
   - 任务ID: T010, T015...
   ```

---

### 阶段3: 重新生成任务分解（15分钟）

**任务**: 基于最新的需求和架构重新生成任务分解

**步骤**:

1. **重新分析项目**

   基于最新的需求和架构文档，重新进行：
   - 功能模块划分
   - 任务优先级排序
   - 任务依赖关系分析
   - 工时估算

2. **生成新的任务列表**

   创建完整的任务分解，包括：
   - 任务ID（保持已完成任务的ID不变）
   - 任务标题和描述
   - 验收标准
   - 技术要点
   - 依赖关系
   - 预估工时

3. **保留已完成任务**

   对于已完成的任务：
   - ✅ 保持任务ID不变
   - ✅ 保持任务描述（除非需求有重大变更）
   - ✅ 标记为已完成状态
   - ⚠️ 如果需求变更影响已完成任务，添加警告注释

4. **处理进行中任务**

   对于进行中的任务：
   - 🔄 评估是否需要调整
   - 🔄 如果需要调整，在任务描述中添加变更说明
   - 🔄 保持进行中状态

---

### 阶段4: 生成新文档（5分钟）

**任务**: 生成新的任务文档和状态文件

**步骤**:

1. **生成 docs/tasks.md**

   使用标准的任务文档格式，包含：
   - 文档元数据（frontmatter）
   - 任务统计
   - 里程碑规划
   - 详细任务列表

2. **生成/更新 task_status.json**

   根据任务数量选择结构：
   
   - **< 50 任务**: 使用扁平结构
   - **≥ 50 任务**: 使用分层结构
   
   保留已完成和进行中任务的状态。

3. **更新元数据**

   ```bash
   if [ -f .claude/tools/doc-manager.js ]; then
     node .claude/tools/doc-manager.js update-metadata docs/tasks.md version "$(echo "scale=1; $(grep 'version:' docs/tasks.md | head -1 | awk '{print $2}') + 0.1" | bc)"
     node .claude/tools/doc-manager.js update-metadata docs/tasks.md last_modified "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
     node .claude/tools/doc-manager.js update-metadata docs/tasks.md modified_by "tech-lead"
   fi
   ```

---

### 阶段5: 生成变更报告（2分钟）

**任务**: 生成详细的变更报告

**输出格式**:

```markdown
# 📋 任务分解重新生成报告

> **生成时间**: [时间戳]  
> **触发原因**: 需求/架构变更

---

## 📊 变更统计

- **总任务数**: 原 X → 新 Y (变化: +Z/-W)
- **新增任务**: Z 个
- **删除任务**: W 个
- **修改任务**: M 个
- **保留任务**: N 个 (其中已完成: P 个)

---

## ✅ 保留的已完成任务

| 任务ID | 任务标题 | 完成时间 |
|--------|---------|---------|
| T001   | ...     | ...     |
| T002   | ...     | ...     |

---

## 🆕 新增任务

| 任务ID | 任务标题 | 原因 | 预估工时 |
|--------|---------|------|---------|
| T086   | ...     | 新需求 | 4h |
| T087   | ...     | 架构调整 | 6h |

---

## 🔄 修改的任务

| 任务ID | 任务标题 | 变更内容 |
|--------|---------|---------|
| T010   | ...     | 更新验收标准 |
| T015   | ...     | 调整技术方案 |

---

## ❌ 删除的任务

| 任务ID | 任务标题 | 原因 |
|--------|---------|------|
| T050   | ...     | 需求取消 |

---

## 🎯 下一步建议

1. 审查新增和修改的任务
2. 评估对开发计划的影响
3. 更新项目时间线
4. 通知团队成员任务变更

---

## 📁 备份位置

- 原任务文档: `.claude/backups/tasks_[timestamp].md`
- 原状态文件: `.claude/backups/task_status_[timestamp].json`
```

---

## 🎯 完成输出

完成后，向用户输出：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 任务分解重新生成完成！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 已更新文档:
  - docs/tasks.md (v[新版本])
  - task_status.json

📊 变更统计:
  - 总任务数: [数量]
  - 新增: [数量] | 修改: [数量] | 删除: [数量]
  - 保留已完成: [数量]

💾 备份位置:
  - .claude/backups/

📋 详细变更报告已生成

🚀 下一步:
  - 审查变更报告
  - 继续开发: /developer [任务ID]
  - 查看状态: /doc-status
```

---

## 📝 注意事项

1. **已完成任务**: 尽可能保留，除非需求完全废弃
2. **进行中任务**: 评估影响，必要时添加变更说明
3. **任务ID**: 保持已完成任务的ID稳定性
4. **备份**: 始终创建备份，以便回滚
5. **变更报告**: 详细记录所有变更，便于团队了解

---

**🎉 开始重新生成任务分解吧！**

